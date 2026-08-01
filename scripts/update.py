#!/usr/bin/env python3
"""Convert the official uBO Lite Chromium rulesets into Egern modules."""

from __future__ import annotations

import argparse
import hashlib
import ipaddress
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.request
import zipfile
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence


PROJECT_ROOT = Path(__file__).resolve().parents[1]
EXTENSION_ID = "ddkjiahejlhfcafbddmgiahcphecmpfh"
RELEASE_API = "https://api.github.com/repos/uBlockOrigin/uBOL-home/releases/latest"
UPSTREAM_HOME = "https://github.com/uBlockOrigin/uBOL-home"
USER_AGENT = "ubol-egern-converter/1.0"
DOCUMENT_RESPONSE_MATCH = (
    r"^https?://(?:[^/?#]+(?:/[^?#.]*)?|"
    r"[^?#]+\.(?:html?|xhtml|php|aspx?|jsp|cfm|cgi))(?:[?#]|$)"
)
NON_IPLARK_DOCUMENT_RESPONSE_MATCH = (
    r"^https?://(?!(?:[^/?#]+\.)?iplark\.com(?::\d+)?(?:[/?#]|$))"
    r"(?:[^/?#]+(?:/[^?#.]*)?|"
    r"[^?#]+\.(?:html?|xhtml|php|aspx?|jsp|cfm|cgi))(?:[?#]|$)"
)
IPLARK_RESPONSE_MATCH = (
    r"^https?://(?:[^/?#]+\.)?iplark\.com(?::\d+)?"
    r"(?:/?(?:[?#].*)?|/static/homepage\.css(?:[?#].*)?)$"
)
COSMETIC_MITM_HOSTNAMES = ("iplark.com", "*.iplark.com")
IPLARK_COSMETIC_SELECTORS = (
    'div[class^="banner"]',
    'div[style="position: relative;"]',
    "body > div:not([class]):not([style])",
    "body > #capture-area ~ div[class]:empty",
)

GROUP_ORDER = (
    "default",
    "ads",
    "privacy",
    "malware",
    "annoyances",
    "misc",
    "regions",
)
GROUP_LABELS = {
    "default": "默认规则",
    "ads": "广告",
    "privacy": "隐私",
    "malware": "恶意软件与安全",
    "annoyances": "烦扰元素",
    "misc": "其他",
    "regions": "地区与语言",
}
GROUP_ICONS = {
    "default": "shield.lefthalf.filled",
    "ads": "rectangle.badge.xmark",
    "privacy": "eye.slash",
    "malware": "exclamationmark.shield",
    "annoyances": "hand.raised",
    "misc": "wrench.and.screwdriver",
    "regions": "globe",
}

# Egern displays compat_arguments keys directly in its module editor. Keep
# these labels short enough for a phone while retaining the official list name
# and a Chinese explanation in compat_arguments_desc.
RULESET_UI: dict[str, tuple[str, str]] = {
    "ublock-filters": ("禁用uBlock主规则", "广告、跟踪器等基础过滤"),
    "easylist": ("禁用EasyList", "通用广告过滤"),
    "easyprivacy": ("禁用EasyPrivacy", "隐私与跟踪器过滤"),
    "pgl": ("禁用PeterLowe", "广告与跟踪器过滤"),
    "adguard-mobile": ("禁用移动广告", "移动端广告过滤"),
    "block-lan": ("禁用局域网入侵防护", "阻止外部网络侵入局域网"),
    "adguard-spyware-url": ("禁用网址跟踪保护", "移除网址跟踪与间谍参数"),
    "ublock-badware": ("禁用uBlock恶意软件", "恶意软件风险过滤"),
    "urlhaus-full": ("禁用恶意网址列表", "已知恶意网址拦截"),
    "annoyances-ai": ("禁用AI组件", "网页 AI 小组件"),
    "annoyances-cookies": ("禁用Cookie提示", "Cookie 同意提示"),
    "annoyances-overlays": ("禁用浮层提示", "弹层与遮罩提示"),
    "annoyances-social": ("禁用社交组件", "社交分享与关注组件"),
    "annoyances-widgets": ("禁用聊天组件", "网页聊天组件"),
    "annoyances-others": ("禁用其他烦扰", "其他网页烦扰元素"),
    "annoyances-notifications": ("禁用通知提示", "网页通知请求与提示"),
    "ublock-experimental": ("禁用uBlock实验规则", "实验性过滤规则"),
    "ubol-tests": ("禁用uBOLite测试规则", "uBO Lite 测试过滤器"),
    "alb-0": ("禁用阿尔巴尼亚列表", "阿尔巴尼亚与科索沃地区"),
    "ara-0": ("禁用阿拉伯语列表", "阿拉伯语地区"),
    "bgr-0": ("禁用保加利亚语列表", "保加利亚语地区"),
    "chn-0": ("禁用AdGuard中文", "中文网站"),
    "cze-0": ("禁用捷克斯洛伐克列表", "捷克语与斯洛伐克语地区"),
    "deu-0": ("禁用EasyList德国", "德语地区"),
    "est-0": ("禁用爱沙尼亚语列表", "爱沙尼亚语地区"),
    "fin-0": ("禁用芬兰语列表", "芬兰语地区"),
    "fra-0": ("禁用AdGuard法语", "法语地区"),
    "grc-0": ("禁用希腊语列表", "希腊语地区"),
    "hrv-0": ("禁用塞尔维亚克罗地亚语", "塞尔维亚-克罗地亚语地区"),
    "hun-0": ("禁用匈牙利语列表", "匈牙利语地区"),
    "idn-0": ("禁用ABPindo", "印度尼西亚语与马来语地区"),
    "ind-0": ("禁用IndianList", "印度、斯里兰卡与尼泊尔地区"),
    "irn-0": ("禁用PersianBlocker", "波斯语地区"),
    "isl-0": ("禁用冰岛语列表", "冰岛语地区"),
    "isr-0": ("禁用EasyList希伯来语", "希伯来语地区"),
    "ita-0": ("禁用EasyList意大利", "意大利语地区"),
    "jpn-1": ("禁用AdGuard日语", "日语地区"),
    "kor-1": ("禁用ListKRClassic", "韩语地区"),
    "ltu-0": ("禁用EasyList立陶宛", "立陶宛语地区"),
    "lva-0": ("禁用拉脱维亚语列表", "拉脱维亚语地区"),
    "mkd-0": ("禁用马其顿语列表", "马其顿语地区"),
    "nld-0": ("禁用AdGuard荷兰语", "荷兰语地区"),
    "nor-0": ("禁用北欧语列表", "挪威、丹麦与冰岛地区"),
    "pol-0": ("禁用波兰语官方列表", "uBlock Origin 波兰语过滤"),
    "pol-3": ("禁用CERTPL威胁列表", "CERT.PL 安全威胁过滤"),
    "rou-1": ("禁用罗马尼亚语列表", "罗马尼亚语与摩尔多瓦地区"),
    "rus-0": ("禁用RUAdList", "俄语及周边地区"),
    "rus-1": ("禁用RUAdList计数器", "俄语网站计数器过滤"),
    "spa-0": ("禁用EasyList西班牙语", "西班牙语地区"),
    "spa-1": ("禁用AdGuard西葡语", "西班牙语与葡萄牙语地区"),
    "svn-0": ("禁用斯洛文尼亚语列表", "斯洛文尼亚语地区"),
    "swe-1": ("禁用瑞典语列表", "瑞典语地区"),
    "tha-0": ("禁用EasyList泰语", "泰语地区"),
    "tur-0": ("禁用AdGuard土耳其语", "土耳其语地区"),
    "ukr-0": ("禁用AdGuard乌克兰语", "乌克兰语地区"),
    "vie-1": ("禁用ABPVN", "越南语地区"),
}

NETWORK_URL_KEYS = {
    "urlFilter",
    "regexFilter",
    "isUrlFilterCaseSensitive",
}
QUERY_ALLOWED_KEYS = {
    "requestDomains",
    "excludedRequestDomains",
    "urlFilter",
    "regexFilter",
    "isUrlFilterCaseSensitive",
    # Egern does not expose a resource type to request scripts. These are
    # deliberately relaxed for query-only transformations and reported.
    "resourceTypes",
    "excludedResourceTypes",
}
QUERY_CONTEXT_KEYS = {
    "initiatorDomains",
    "excludedInitiatorDomains",
    "topDomains",
    "excludedTopDomains",
    "domainType",
    "requestMethods",
    "responseHeaders",
}


@dataclass(frozen=True)
class SourceInfo:
    version: str
    release_url: str
    asset_url: str | None = None
    asset_sha256: str | None = None
    published_at: str | None = None
    origin: str = "official-release"


@dataclass(frozen=True)
class ModulePreset:
    enabled: frozenset[str]
    included: frozenset[str] | None
    name: str = "uBlock Origin Lite 规则"
    description: str | None = None
    icon: str = "shield.lefthalf.filled"
    profile: str | None = None
    expose_list_switches: bool = True


@dataclass
class NetworkOutput:
    domain_suffixes: list[str]
    ipv4_cidrs: list[str]
    ipv6_cidrs: list[str]
    url_regexes: list[str]
    stats: dict[str, int]


@dataclass
class QueryOutput:
    operations: list[dict[str, Any]]
    stats: dict[str, int]
    sample: dict[str, str] | None


@dataclass
class CosmeticOutput:
    selectors: list[str]
    selector_lists: list[str]
    selector_list_refs: list[int]
    hostnames: list[str]
    has_entities: bool
    regexes: list[Any]
    stats: dict[str, int]


def http_request(url: str) -> urllib.request.Request:
    return urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": USER_AGENT,
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )


def fetch_json(url: str) -> dict[str, Any]:
    with urllib.request.urlopen(http_request(url), timeout=60) as response:
        return json.load(response)


def download_asset(url: str, destination: Path, expected_sha256: str | None) -> str:
    digest = hashlib.sha256()
    with urllib.request.urlopen(http_request(url), timeout=120) as response:
        with destination.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                digest.update(chunk)
                output.write(chunk)

    actual = digest.hexdigest()
    if expected_sha256 and actual.lower() != expected_sha256.lower():
        raise RuntimeError(
            f"SHA-256 mismatch for {url}: expected {expected_sha256}, got {actual}"
        )
    return actual


def safe_extract_zip(archive: Path, destination: Path) -> None:
    destination = destination.resolve()
    with zipfile.ZipFile(archive) as bundle:
        for member in bundle.infolist():
            target = (destination / member.filename).resolve()
            if target != destination and destination not in target.parents:
                raise RuntimeError(f"Unsafe path in release archive: {member.filename}")
        bundle.extractall(destination)


def find_extension_root(root: Path) -> Path:
    root = root.resolve()
    candidates = [root, *root.rglob("manifest.json")]
    for candidate in candidates:
        folder = candidate if candidate.is_dir() else candidate.parent
        if (folder / "manifest.json").is_file() and (
            folder / "rulesets" / "ruleset-details.json"
        ).is_file():
            return folder
    raise RuntimeError(f"No uBO Lite extension root found below {root}")


def download_latest_release(temp_root: Path) -> tuple[Path, SourceInfo]:
    release = fetch_json(RELEASE_API)
    version = str(release["tag_name"])
    assets = release.get("assets", [])
    asset = next(
        (
            item
            for item in assets
            if re.fullmatch(r"uBOLite_.+\.chromium\.zip", item.get("name", ""))
        ),
        None,
    )
    if asset is None:
        raise RuntimeError(f"No Chromium bundle found in uBO Lite release {version}")

    digest_value = asset.get("digest")
    expected = None
    if digest_value:
        algorithm, separator, value = digest_value.partition(":")
        if separator != ":" or algorithm.lower() != "sha256":
            raise RuntimeError(f"Unsupported GitHub asset digest: {digest_value}")
        expected = value

    archive = temp_root / asset["name"]
    actual = download_asset(asset["browser_download_url"], archive, expected)
    extracted = temp_root / "extension"
    extracted.mkdir()
    safe_extract_zip(archive, extracted)
    extension_root = find_extension_root(extracted)
    return extension_root, SourceInfo(
        version=version,
        release_url=str(release["html_url"]),
        asset_url=str(asset["browser_download_url"]),
        asset_sha256=actual,
        published_at=release.get("published_at"),
    )


def source_from_local(extension_dir: Path) -> tuple[Path, SourceInfo]:
    root = find_extension_root(extension_dir)
    manifest = read_json(root / "manifest.json")
    version = str(manifest["version"])
    return root, SourceInfo(
        version=version,
        release_url=f"{UPSTREAM_HOME}/releases/tag/{version}",
        asset_url=(
            f"{UPSTREAM_HOME}/releases/download/{version}/"
            f"uBOLite_{version}.chromium.zip"
        ),
        origin="local-extension",
    )


def discover_installed_extension() -> Path | None:
    local_app_data = os.environ.get("LOCALAPPDATA")
    if not local_app_data:
        return None
    extension_base = (
        Path(local_app_data)
        / "Google"
        / "Chrome"
        / "User Data"
        / "Default"
        / "Extensions"
        / EXTENSION_ID
    )
    if not extension_base.is_dir():
        return None

    candidates: list[tuple[tuple[int, ...], Path]] = []
    for child in extension_base.iterdir():
        if not child.is_dir():
            continue
        match = re.match(r"(\d+(?:\.\d+)+)", child.name)
        if not match:
            continue
        candidates.append((tuple(map(int, match.group(1).split("."))), child))
    return max(candidates, default=((), None))[1]


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as source:
        return json.load(source)


def normalize_domain(value: str) -> str:
    return value.strip().lower().strip(".")


def related_domains(left: str, right: str) -> bool:
    return (
        left == right
        or left.endswith(f".{right}")
        or right.endswith(f".{left}")
    )


def minimize_domains(domains: Iterable[str]) -> list[str]:
    ordered = sorted(set(domains), key=lambda item: (item.count("."), len(item), item))
    kept: set[str] = set()
    output: list[str] = []
    for domain in ordered:
        labels = domain.split(".")
        if any(".".join(labels[index:]) in kept for index in range(len(labels))):
            continue
        kept.add(domain)
        output.append(domain)
    return sorted(output)


def split_domains_and_ips(domains: Iterable[str]) -> tuple[list[str], list[str], list[str]]:
    hostnames: list[str] = []
    ipv4: list[str] = []
    ipv6: list[str] = []
    for value in domains:
        try:
            address = ipaddress.ip_address(value)
        except ValueError:
            hostnames.append(value)
            continue
        if address.version == 4:
            ipv4.append(f"{address}/32")
        else:
            ipv6.append(f"{address}/128")
    return minimize_domains(hostnames), sorted(set(ipv4)), sorted(set(ipv6))


def _has_unescaped_trailing_pipe(value: str) -> bool:
    if not value.endswith("|"):
        return False
    backslashes = 0
    for character in reversed(value[:-1]):
        if character != "\\":
            break
        backslashes += 1
    return backslashes % 2 == 0


def url_filter_to_regex(url_filter: str) -> str:
    """Translate Chrome DNR urlFilter syntax to a regular expression."""
    if not url_filter:
        raise ValueError("urlFilter must not be empty")

    value = url_filter
    domain_anchor = value.startswith("||")
    left_anchor = value.startswith("|") and not domain_anchor
    if domain_anchor:
        value = value[2:]
    elif left_anchor:
        value = value[1:]

    right_anchor = _has_unescaped_trailing_pipe(value)
    if right_anchor:
        value = value[:-1]

    output: list[str] = []
    index = 0
    while index < len(value):
        character = value[index]
        if character == "*":
            output.append(".*")
        elif character == "^":
            output.append(r"(?:[^A-Za-z0-9_.%\-]|$)")
        elif character == "\\" and index + 1 < len(value):
            index += 1
            output.append(re.escape(value[index]))
        else:
            output.append(re.escape(character))
        index += 1

    if domain_anchor:
        prefix = r"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\.)?"
    elif left_anchor:
        prefix = "^"
    else:
        prefix = ""
    suffix = "$" if right_anchor else ""
    return prefix + "".join(output) + suffix


def condition_regex(condition: dict[str, Any], for_javascript: bool = False) -> tuple[str, bool]:
    case_sensitive = bool(condition.get("isUrlFilterCaseSensitive", False))
    if "regexFilter" in condition:
        pattern = str(condition["regexFilter"])
    else:
        pattern = url_filter_to_regex(str(condition["urlFilter"]))
    if not for_javascript and not case_sensitive:
        pattern = "(?i)" + pattern
    return pattern, case_sensitive


def load_rules(ruleset_root: Path, ruleset_id: str) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    for category in ("main", "regex"):
        path = ruleset_root / category / f"{ruleset_id}.json"
        if path.is_file():
            output.extend(read_json(path))
    return output


def load_strictblock_rules(
    ruleset_root: Path, ruleset_id: str
) -> list[dict[str, Any]]:
    path = ruleset_root / "strictblock" / f"{ruleset_id}.json"
    return read_json(path) if path.is_file() else []


def convert_specific_cosmetic_rules(
    ruleset_root: Path,
    ruleset_id: str,
    include_specific_css: bool = False,
) -> CosmeticOutput:
    if not include_specific_css:
        return CosmeticOutput([], [], [], [], False, [], {})
    path = ruleset_root / "scripting" / "specific" / f"{ruleset_id}.json"
    if not path.is_file():
        return CosmeticOutput([], [], [], [], False, [], {})

    document = read_json(path)
    raw_selectors = document.get("selectors", [])
    raw_lists = document.get("selectorLists", [])
    raw_refs = document.get("selectorListRefs", [])
    raw_hostnames = document.get("hostnames", [])
    raw_regexes = document.get("regexes", [])
    stats: Counter[str] = Counter(
        {
            "input_selectors": len(raw_selectors),
            "input_selector_lists": len(raw_lists),
            "input_hostnames": len(raw_hostnames),
            "input_regex_rules": len(raw_regexes) // 3,
        }
    )

    eligible: dict[int, str] = {}
    for index, selector in enumerate(raw_selectors):
        if not isinstance(selector, str):
            stats["skipped_invalid_selectors"] += 1
        elif selector.startswith("{"):
            stats["skipped_procedural_selectors"] += 1
        elif "</style" in selector.lower():
            stats["skipped_unsafe_selectors"] += 1
        else:
            eligible[index] = selector

    selectors: list[str] = []
    selector_indices: dict[int, int] = {}
    selector_lists: list[str] = []
    selector_list_indices: dict[tuple[int, ...], int] = {}
    list_ref_map: dict[int, int] = {}

    for old_list_index, encoded in enumerate(raw_lists):
        if not isinstance(encoded, str):
            stats["skipped_invalid_selector_lists"] += 1
            continue
        try:
            old_indices = json.loads(f"[{encoded}]")
        except (json.JSONDecodeError, TypeError):
            stats["skipped_invalid_selector_lists"] += 1
            continue

        new_indices: list[int] = []
        for signed_index in old_indices:
            if not isinstance(signed_index, int):
                stats["skipped_invalid_selector_references"] += 1
                continue
            old_selector_index = signed_index if signed_index >= 0 else ~signed_index
            selector = eligible.get(old_selector_index)
            if selector is None:
                continue
            new_selector_index = selector_indices.get(old_selector_index)
            if new_selector_index is None:
                new_selector_index = len(selectors)
                selector_indices[old_selector_index] = new_selector_index
                selectors.append(selector)
            new_indices.append(
                new_selector_index if signed_index >= 0 else ~new_selector_index
            )

        if not new_indices:
            continue
        key = tuple(new_indices)
        new_list_index = selector_list_indices.get(key)
        if new_list_index is None:
            new_list_index = len(selector_lists)
            selector_list_indices[key] = new_list_index
            selector_lists.append(",".join(map(str, new_indices)))
        list_ref_map[old_list_index] = new_list_index

    hostnames: list[str] = []
    selector_list_refs: list[int] = []
    for hostname, old_ref in zip(raw_hostnames, raw_refs, strict=False):
        if not isinstance(hostname, str) or not isinstance(old_ref, int):
            stats["skipped_invalid_hostname_references"] += 1
            continue
        new_ref = list_ref_map.get(old_ref)
        if new_ref is None:
            continue
        hostnames.append(hostname)
        selector_list_refs.append(new_ref)

    regexes: list[Any] = []
    for index in range(0, len(raw_regexes) - 2, 3):
        needle, pattern, old_ref = raw_regexes[index : index + 3]
        if not isinstance(old_ref, int):
            stats["skipped_invalid_regex_references"] += 1
            continue
        new_ref = list_ref_map.get(old_ref)
        if new_ref is None:
            continue
        regexes.extend([needle, pattern, new_ref])

    stats.update(
        {
            "eligible_plain_selectors": len(selectors),
            "eligible_selector_lists": len(selector_lists),
            "eligible_hostnames": len(hostnames),
            "eligible_regex_rules": len(regexes) // 3,
        }
    )
    stats.update(
        {
            "plain_selectors": len(selectors),
            "selector_lists": len(selector_lists),
            "hostnames": len(hostnames),
            "regex_rules": len(regexes) // 3,
        }
    )
    return CosmeticOutput(
        selectors=selectors,
        selector_lists=selector_lists,
        selector_list_refs=selector_list_refs,
        hostnames=hostnames,
        has_entities=bool(document.get("hasEntities", False)),
        regexes=regexes,
        stats=dict(sorted(stats.items())),
    )


def collect_exception_domains(rules: Sequence[dict[str, Any]]) -> set[str]:
    exceptions: set[str] = set()
    for rule in rules:
        condition = rule.get("condition", {})
        if rule.get("action", {}).get("type") in {"allow", "allowAllRequests"}:
            exceptions.update(
                normalize_domain(value) for value in condition.get("requestDomains", [])
            )
        exceptions.update(
            normalize_domain(value)
            for value in condition.get("excludedRequestDomains", [])
        )
    return {value for value in exceptions if value}


def convert_network_rules(
    rules: Sequence[dict[str, Any]],
    strictblock_rules: Sequence[dict[str, Any]] = (),
    include_url_regex: bool = False,
) -> NetworkOutput:
    exceptions = collect_exception_domains([*rules, *strictblock_rules])
    domain_candidates: set[str] = set()
    url_regexes: set[str] = set()
    stats: Counter[str] = Counter()

    for rule in rules:
        if rule.get("action", {}).get("type") != "block":
            continue
        stats["input_block_rules"] += 1
        condition = rule.get("condition", {})
        keys = set(condition)

        if keys == {"requestDomains"}:
            domains = {
                normalize_domain(value) for value in condition.get("requestDomains", [])
            }
            domains.discard("")
            if domains:
                domain_candidates.update(domains)
                stats["converted_domain_rules"] += 1
                continue

        has_filter = "urlFilter" in condition or "regexFilter" in condition
        allowed_keys = NETWORK_URL_KEYS
        if has_filter and "requestDomains" not in condition and keys <= allowed_keys:
            try:
                pattern, _ = condition_regex(condition)
            except (KeyError, ValueError, re.error):
                stats["skipped_invalid_filter"] += 1
            else:
                url_regexes.add(pattern)
                stats["converted_url_rules"] += 1
                continue

        stats["skipped_contextual_block_rules"] += 1

    stats["input_strictblock_rules"] = len(strictblock_rules)
    for rule in strictblock_rules:
        action = rule.get("action", {})
        redirect = action.get("redirect", {})
        condition = rule.get("condition", {})
        keys = set(condition)
        is_whole_url = condition.get("regexFilter") == r"^https?://.*"
        allowed_keys = {
            "requestDomains",
            "excludedRequestDomains",
            "regexFilter",
            "resourceTypes",
        }
        if (
            action.get("type") == "redirect"
            and "strictblock.html" in str(redirect.get("regexSubstitution", ""))
            and is_whole_url
            and "requestDomains" in condition
            and keys <= allowed_keys
        ):
            domain_candidates.update(
                normalize_domain(value)
                for value in condition.get("requestDomains", [])
                if normalize_domain(value)
            )
            stats["converted_strictblock_domain_rules"] += 1
        else:
            stats["skipped_contextual_strictblock_rules"] += 1

    stats["candidate_domains"] = len(domain_candidates)
    filtered_domains = {
        domain
        for domain in domain_candidates
        if not any(related_domains(domain, exception) for exception in exceptions)
    }
    stats["exception_domains"] = len(exceptions)
    stats["domains_removed_for_exceptions"] = len(domain_candidates) - len(
        filtered_domains
    )

    domains, ipv4, ipv6 = split_domains_and_ips(filtered_domains)
    stats["domain_suffixes"] = len(domains)
    stats["ipv4_cidrs"] = len(ipv4)
    stats["ipv6_cidrs"] = len(ipv6)
    stats["eligible_url_regexes"] = len(url_regexes)
    emitted_url_regexes = sorted(url_regexes) if include_url_regex else []
    if not include_url_regex:
        stats["url_regexes_omitted_for_memory"] = len(url_regexes)
    stats["url_regexes"] = len(emitted_url_regexes)
    return NetworkOutput(
        domain_suffixes=domains,
        ipv4_cidrs=ipv4,
        ipv6_cidrs=ipv6,
        url_regexes=emitted_url_regexes,
        stats=dict(sorted(stats.items())),
    )


def _query_operation(rule: dict[str, Any], stats: Counter[str]) -> dict[str, Any] | None:
    action = rule.get("action", {})
    if action.get("type") != "redirect":
        return None
    transform = action.get("redirect", {}).get("transform")
    if not isinstance(transform, dict):
        return None
    if "queryTransform" not in transform and "query" not in transform:
        return None

    stats["input_query_rules"] += 1
    condition = rule.get("condition", {})
    keys = set(condition)
    if keys & QUERY_CONTEXT_KEYS or not keys <= QUERY_ALLOWED_KEYS:
        stats["skipped_contextual_query_rules"] += 1
        return None

    if keys & {"resourceTypes", "excludedResourceTypes"}:
        stats["resource_type_conditions_relaxed"] += 1

    operation: dict[str, Any] = {}
    domains = sorted(
        {
            normalize_domain(value)
            for value in condition.get("requestDomains", [])
            if normalize_domain(value)
        }
    )
    excluded = sorted(
        {
            normalize_domain(value)
            for value in condition.get("excludedRequestDomains", [])
            if normalize_domain(value)
        }
    )
    if domains:
        operation["d"] = domains
    if excluded:
        operation["x"] = excluded

    query_transform = transform.get("queryTransform")
    if query_transform is not None:
        if set(query_transform) != {"removeParams"}:
            stats["skipped_unsupported_query_transform"] += 1
            return None
        params = [
            str(value)
            for value in query_transform.get("removeParams", [])
            if str(value)
        ]
        if not params:
            stats["skipped_unsupported_query_transform"] += 1
            return None
        operation["p"] = sorted(set(params))
        simple_filter = (
            len(operation["p"]) == 1
            and condition.get("urlFilter") == f"^{operation['p'][0]}="
            and "regexFilter" not in condition
        )
        if not simple_filter and (
            "urlFilter" in condition or "regexFilter" in condition
        ):
            try:
                pattern, case_sensitive = condition_regex(
                    condition, for_javascript=True
                )
            except (KeyError, ValueError, re.error):
                stats["skipped_invalid_query_filter"] += 1
                return None
            operation["f"] = pattern
            if case_sensitive:
                operation["s"] = True
    elif transform.get("query") == "":
        operation["q"] = True
        if "urlFilter" in condition or "regexFilter" in condition:
            try:
                pattern, case_sensitive = condition_regex(
                    condition, for_javascript=True
                )
            except (KeyError, ValueError, re.error):
                stats["skipped_invalid_query_filter"] += 1
                return None
            operation["f"] = pattern
            if case_sensitive:
                operation["s"] = True
        elif not domains:
            stats["skipped_unsupported_query_transform"] += 1
            return None
    else:
        stats["skipped_unsupported_query_transform"] += 1
        return None

    stats["converted_query_rules"] += 1
    return operation


def convert_query_rules(rules: Sequence[dict[str, Any]]) -> QueryOutput:
    stats: Counter[str] = Counter()
    operations_by_key: dict[str, dict[str, Any]] = {}
    for rule in rules:
        operation = _query_operation(rule, stats)
        if operation is None:
            continue
        key = json.dumps(operation, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        operations_by_key[key] = operation

    operations = [operations_by_key[key] for key in sorted(operations_by_key)]
    stats["deduplicated_query_rules"] = stats["converted_query_rules"] - len(
        operations
    )
    stats["query_operations"] = len(operations)

    sample = None
    for operation in operations:
        if "p" not in operation or "f" in operation or operation.get("x"):
            continue
        sample = {
            "domain": operation.get("d", ["example.com"])[0],
            "parameter": operation["p"][0],
        }
        break
    return QueryOutput(
        operations=operations,
        stats=dict(sorted(stats.items())),
        sample=sample,
    )


def yaml_quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def render_yaml_set(name: str, values: Sequence[str]) -> list[str]:
    if not values:
        return [f"{name}: []"]
    return [f"{name}:", *(f"  - {yaml_quote(value)}" for value in values)]


def render_ruleset(source: SourceInfo, output: NetworkOutput) -> str:
    lines = [
        f"# Generated from official uBO Lite {source.version}.",
        "# Do not edit this file by hand; run scripts/update.py.",
        "no_resolve: true",
    ]
    lines.extend(render_yaml_set("domain_suffix_set", output.domain_suffixes))
    lines.extend(render_yaml_set("ip_cidr_set", output.ipv4_cidrs))
    lines.extend(render_yaml_set("ip_cidr6_set", output.ipv6_cidrs))
    lines.extend(render_yaml_set("url_regex_set", output.url_regexes))
    return "\n".join(lines) + "\n"


def relative_or_remote(base_url: str, category: str, filename: str) -> str:
    if base_url == ".":
        return f"./{category}/{filename}"
    return f"{base_url.rstrip('/')}/{category}/{filename}"


def switch_key(ruleset_id: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9]+", "_", ruleset_id).strip("_").upper()
    return f"DISABLE_{normalized}"


def argument_key(ruleset_id: str) -> str:
    entry = RULESET_UI.get(ruleset_id)
    return entry[0] if entry else switch_key(ruleset_id)


def ruleset_purpose(ruleset_id: str) -> str | None:
    entry = RULESET_UI.get(ruleset_id)
    return entry[1] if entry else None


def render_combined_module(
    source: SourceInfo,
    items: Sequence[dict[str, Any]],
    preset: ModulePreset,
    base_url: str,
    policy: str,
    include_url_regex: bool,
    include_specific_css: bool,
) -> str:
    enabled = set(preset.enabled)
    if include_specific_css:
        profile = "完整 URL 过滤与站点专用 CSS 元素隐藏"
    elif include_url_regex:
        profile = "完整 URL 过滤"
    else:
        profile = "内存安全，仅域名/IP"
    ordered_items = [
        item
        for group in GROUP_ORDER
        for item in items
        if effective_group(item["meta"]) == group
    ]
    description = preset.description or (
        f"一个 Egern 模块，包含 {len(items)} 个可独立配置的 uBO Lite "
        f"{source.version} 过滤列表开关（{profile}）。"
    )
    lines = [
        f"name: {yaml_quote(preset.name)}",
        "description: " + yaml_quote(description),
        f"author: {yaml_quote('Raymond Hill 与各上游过滤列表维护者')}",
        f"homepage: {yaml_quote(UPSTREAM_HOME)}",
        f"manual: {yaml_quote(UPSTREAM_HOME)}",
        f"icon: {yaml_quote(preset.icon)}",
        "",
        "compat_arguments:",
        f"  {yaml_quote('拦截策略')}: {yaml_quote(policy)}",
    ]
    if preset.expose_list_switches:
        for item in ordered_items:
            id_value = str(item["meta"]["id"])
            lines.append(
                f"  {yaml_quote(argument_key(id_value))}: "
                f"{'false' if id_value in enabled else 'true'}"
            )

        lines.extend(
            [
                "compat_arguments_desc: |",
                "  所有“禁用…”参数：false 表示启用该列表，true 表示禁用。",
                "  “拦截策略”控制所有已启用列表采用的 Egern 策略。",
            ]
        )
        for group in GROUP_ORDER:
            group_items = [
                item for item in items if effective_group(item["meta"]) == group
            ]
            if not group_items:
                continue
            lines.append(f"  [{GROUP_LABELS[group]}]")
            for item in group_items:
                meta = item["meta"]
                id_value = str(meta["id"])
                purpose = ruleset_purpose(id_value)
                suffix = f"（{purpose}）" if purpose else ""
                lines.append(
                    f"  {argument_key(id_value)}: {meta['name']}{suffix}"
                )
    else:
        lines.extend(
            [
                "compat_arguments_desc: |",
                "  “拦截策略”控制本模块采用的 Egern 策略。",
            ]
        )

    has_query_scripts = any(item["query"].operations for item in items)
    if has_query_scripts or include_specific_css:
        lines.extend(["", "env_schema:"])
    if has_query_scripts:
        lines.extend(
            [
                "  ENABLE_QUERY_CLEANING:",
                f"    name: {yaml_quote('URL 查询参数清理')}",
                "    description: "
                + yaml_quote(
                    "关闭后仅停用 URL 查询参数清理，原生拦截规则不受影响。"
                ),
                f"    default_value: {yaml_quote('true')}",
                "    options:",
                f"      - {yaml_quote('true')}",
                f"      - {yaml_quote('false')}",
            ]
        )
    if include_specific_css:
        lines.extend(
            [
                "  ENABLE_COSMETIC_FILTERING:",
                f"    name: {yaml_quote('Safari 网页元素隐藏')}",
                "    description: "
                + yaml_quote(
                    "注入官方列表中的站点专用纯 CSS 规则；HTTPS 站点需要 MITM。"
                ),
                f"    default_value: {yaml_quote('true')}",
                "    options:",
                f"      - {yaml_quote('true')}",
                f"      - {yaml_quote('false')}",
            ]
        )

    lines.extend(["", "rules:"])
    for item in ordered_items:
        meta = item["meta"]
        id_value = str(meta["id"])
        rule_lines = [
            "  - rule_set:",
            f"      name: {yaml_quote(str(meta['name']))}",
            "      match: "
            + yaml_quote(
                relative_or_remote(base_url, "rulesets", f"{id_value}.yaml")
            ),
            f"      policy: {yaml_quote('{{{拦截策略}}}')}",
            "      update_interval: 86400",
        ]
        if preset.expose_list_switches:
            rule_lines.append("      disabled: {{{" + argument_key(id_value) + "}}}")
        else:
            rule_lines.append("      disabled: false")
        lines.extend(rule_lines)

    query_items = [item for item in ordered_items if item["query"].operations]
    cosmetic_items = [
        item
        for item in ordered_items
        if item["cosmetic"].hostnames or item["cosmetic"].regexes
    ]
    if query_items or cosmetic_items:
        lines.extend(["", "scriptings:"])
        for item in query_items:
            meta = item["meta"]
            id_value = str(meta["id"])
            script_lines = [
                "  - http_request:",
                f"      name: {yaml_quote(str(meta['name']) + ' - query cleaner')}",
                f"      match: {yaml_quote('^https?://')}",
                "      script_url: "
                + yaml_quote(
                    relative_or_remote(base_url, "scripts", f"{id_value}.js")
                ),
                "      update_interval: 86400",
                "      timeout: 5",
            ]
            if preset.expose_list_switches:
                script_lines.append(
                    "      disabled: {{{" + argument_key(id_value) + "}}}"
                )
            else:
                script_lines.append("      disabled: false")
            lines.extend(script_lines)

        for item in cosmetic_items:
            meta = item["meta"]
            id_value = str(meta["id"])
            script_lines = [
                "  - http_response:",
                f"      name: {yaml_quote(str(meta['name']) + ' - Safari 网页元素隐藏')}",
                f"      match: {yaml_quote(NON_IPLARK_DOCUMENT_RESPONSE_MATCH)}",
                "      script_url: "
                + yaml_quote(
                    relative_or_remote(base_url, "cosmetic", f"{id_value}.js")
                ),
                "      update_interval: 86400",
                "      max_size: 1048576",
                "      timeout: 5",
                "      body_required: true",
            ]
            if preset.expose_list_switches:
                script_lines.append(
                    "      disabled: {{{" + argument_key(id_value) + "}}}"
                )
            else:
                script_lines.append("      disabled: false")
            lines.extend(script_lines)

        has_iplark_bridge = include_specific_css and any(
            str(item["meta"]["id"]) == "chn-0" for item in ordered_items
        )
        if has_iplark_bridge:
            lines.extend(
                [
                    "  - http_response:",
                    f"      name: {yaml_quote('AdGuard Chinese (中文) - IPLark 专用广告隐藏（HTML + CSS）')}",
                    f"      match: {yaml_quote(IPLARK_RESPONSE_MATCH)}",
                    "      script_url: "
                    + yaml_quote(
                        relative_or_remote(
                            base_url, "cosmetic", "iplark-homepage-css.js"
                        )
                    ),
                    "      update_interval: 86400",
                    "      max_size: 1048576",
                    "      timeout: 5",
                    "      body_required: true",
                ]
            )
            if preset.expose_list_switches:
                lines.append(
                    "      disabled: {{{" + argument_key("chn-0") + "}}}"
                )
            else:
                lines.append("      disabled: false")

    if include_specific_css and any(
        str(item["meta"]["id"]) == "chn-0" for item in ordered_items
    ):
        lines.extend(["", "mitm:", "  hostnames:", "    includes:"])
        lines.extend(
            f"      - {yaml_quote(hostname)}"
            for hostname in COSMETIC_MITM_HOSTNAMES
        )

    return "\n".join(lines) + "\n"


def render_query_script(source: SourceInfo, operations: Sequence[dict[str, Any]]) -> str:
    rows = ",\n".join(
        "  "
        + json.dumps(
            operation,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        for operation in operations
    )
    return f"""// Generated from official uBO Lite {source.version}.
// Query-only transforms without initiator/domain-type conditions are included.

const OPS = [
{rows}
];

const PARAM_OPS = new Map();
const CLEAR_OPS = [];

for (let index = 0; index < OPS.length; index += 1) {{
  const operation = OPS[index];
  if (operation.q) {{
    CLEAR_OPS.push(index);
  }}
  for (const parameter of operation.p || []) {{
    let indexes = PARAM_OPS.get(parameter);
    if (indexes === undefined) {{
      indexes = [];
      PARAM_OPS.set(parameter, indexes);
    }}
    indexes.push(index);
  }}
  if (operation.f) {{
    try {{
      operation.r = new RegExp(operation.f, operation.s ? "" : "i");
    }} catch {{
      operation.r = null;
    }}
  }}
}}

function domainMatches(hostname, domain) {{
  return hostname === domain || hostname.endsWith(`.${{domain}}`);
}}

function scopeMatches(hostname, operation) {{
  if (operation.d && !operation.d.some((domain) => domainMatches(hostname, domain))) {{
    return false;
  }}
  if (operation.x && operation.x.some((domain) => domainMatches(hostname, domain))) {{
    return false;
  }}
  return true;
}}

function filterMatches(url, operation) {{
  return operation.f === undefined || operation.r?.test(url) === true;
}}

export function cleanUrl(input) {{
  let parsed;
  try {{
    parsed = new URL(input);
  }} catch {{
    return undefined;
  }}
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {{
    return undefined;
  }}

  const hostname = parsed.hostname.toLowerCase().replace(/\\.$/, "");
  for (const index of CLEAR_OPS) {{
    const operation = OPS[index];
    if (
      parsed.search &&
      scopeMatches(hostname, operation) &&
      filterMatches(input, operation)
    ) {{
      parsed.search = "";
      return parsed.toString();
    }}
  }}

  const visited = new Set();
  let changed = false;
  for (const parameter of new Set(parsed.searchParams.keys())) {{
    for (const index of PARAM_OPS.get(parameter) || []) {{
      if (visited.has(index)) {{
        continue;
      }}
      visited.add(index);
      const operation = OPS[index];
      if (!scopeMatches(hostname, operation) || !filterMatches(input, operation)) {{
        continue;
      }}
      for (const name of operation.p) {{
        if (parsed.searchParams.has(name)) {{
          parsed.searchParams.delete(name);
          changed = true;
        }}
      }}
    }}
  }}
  return changed ? parsed.toString() : undefined;
}}

export default async function (ctx) {{
  if (ctx.env?.ENABLE_QUERY_CLEANING === "false") {{
    return undefined;
  }}
  const cleaned = cleanUrl(ctx.request?.url);
  return cleaned === undefined ? undefined : {{ url: cleaned }};
}}
"""


def render_iplark_cosmetic_script(source: SourceInfo) -> str:
    selectors = json.dumps(
        IPLARK_COSMETIC_SELECTORS,
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return f'''// Generated from official uBO Lite {source.version}.
// Dedicated IPLark bridge for the four AdGuard Chinese cosmetic selectors.
// The site injects its ad containers after page load, so the rules are also
// appended to its external stylesheet as a CSP-independent path.

const SELECTORS = {selectors};
const CSS = `${{SELECTORS.join(",\\n")}}{{display:none!important;}}`;
const HTML_MARKER = 'data-egern-ubol="iplark"';
const STYLESHEET_MARKER = "/* egern-ubol:iplark */";

export function injectCss(html) {{
  if (html.includes(HTML_MARKER)) {{
    return html;
  }}
  const style = `<style ${{HTML_MARKER}}>${{CSS}}</style>`;
  if (/<\\/head\\s*>/i.test(html)) {{
    return html.replace(/<\\/head\\s*>/i, (closing) => style + closing);
  }}
  if (/<body\\b[^>]*>/i.test(html)) {{
    return html.replace(/<body\\b[^>]*>/i, (opening) => opening + style);
  }}
  return style + html;
}}

export function injectStylesheet(stylesheet) {{
  if (stylesheet.includes(STYLESHEET_MARKER)) {{
    return stylesheet;
  }}
  return `${{stylesheet}}\\n${{STYLESHEET_MARKER}}\\n${{CSS}}\\n`;
}}

function responseContentType(ctx) {{
  const headers = ctx.response?.headers;
  if (typeof headers?.get === "function") {{
    return headers.get("content-type") || "";
  }}
  return headers?.["content-type"] || headers?.["Content-Type"] || "";
}}

export default async function (ctx) {{
  if (ctx.env?.ENABLE_COSMETIC_FILTERING === "false") {{
    return undefined;
  }}
  const contentType = responseContentType(ctx);
  const url = ctx.request?.url || "";
  if (/text\\/css/i.test(contentType) || /\\/static\\/homepage\\.css(?:[?#]|$)/i.test(url)) {{
    const stylesheet = await ctx.response.text();
    const body = injectStylesheet(stylesheet);
    return body === stylesheet ? undefined : {{ body }};
  }}
  if (contentType && !/(?:text\\/html|application\\/xhtml\\+xml)/i.test(contentType)) {{
    return undefined;
  }}
  const html = await ctx.response.text();
  const body = injectCss(html);
  return body === html ? undefined : {{ body }};
}}
'''


def render_cosmetic_script(
    source: SourceInfo, ruleset_id: str, output: CosmeticOutput
) -> str:
    constants = "\n".join(
        [
            "const RULESET_ID = " + json.dumps(ruleset_id) + ";",
            "const SELECTORS = "
            + json.dumps(output.selectors, ensure_ascii=False, separators=(",", ":"))
            + ";",
            "const SELECTOR_LISTS = "
            + json.dumps(
                output.selector_lists, ensure_ascii=False, separators=(",", ":")
            )
            + ";",
            "const HOSTNAMES = "
            + json.dumps(output.hostnames, ensure_ascii=False, separators=(",", ":"))
            + ";",
            "const SELECTOR_LIST_REFS = "
            + json.dumps(output.selector_list_refs, separators=(",", ":"))
            + ";",
            "const HAS_ENTITIES = "
            + ("true" if output.has_entities else "false")
            + ";",
            "const REGEXES = "
            + json.dumps(output.regexes, ensure_ascii=False, separators=(",", ":"))
            + ";",
        ]
    )
    runtime = r'''

function hostnameIndex(needle) {
  let left = 0;
  let right = HOSTNAMES.length;
  while (left < right) {
    const index = (left + right) >>> 1;
    const candidate = HOSTNAMES[index];
    let order = needle.length - candidate.length;
    if (order === 0) {
      if (needle === candidate) {
        return index;
      }
      order = needle < candidate ? -1 : 1;
    }
    if (order < 0) {
      right = index;
    } else {
      left = index + 1;
    }
  }
  return -1;
}

function addSelectorList(reference, selectors, exceptions) {
  const encoded = SELECTOR_LISTS[reference];
  if (encoded === undefined) {
    return;
  }
  for (const part of encoded.split(",")) {
    const signedIndex = Number(part);
    const selector = SELECTORS[signedIndex >= 0 ? signedIndex : ~signedIndex];
    if (selector === undefined) {
      continue;
    }
    (signedIndex >= 0 ? selectors : exceptions).add(selector);
  }
}

function hostnameContexts(hostname) {
  const contexts = [hostname];
  for (let offset = 0; ; ) {
    offset = hostname.indexOf(".", offset) + 1;
    if (offset === 0) {
      break;
    }
    contexts.push(hostname.slice(offset));
  }
  contexts.push("*");
  return contexts;
}

export function selectorsForHostname(input) {
  const hostname = String(input || "").toLowerCase().replace(/\.$/, "");
  if (hostname === "") {
    return [];
  }

  const selectors = new Set();
  const exceptions = new Set();
  const contexts = hostnameContexts(hostname);
  for (const context of contexts) {
    const index = hostnameIndex(context);
    if (index !== -1) {
      addSelectorList(SELECTOR_LIST_REFS[index], selectors, exceptions);
    }
  }

  if (HAS_ENTITIES) {
    for (const context of contexts) {
      let entity = context;
      for (;;) {
        const offset = entity.lastIndexOf(".");
        if (offset === -1) {
          break;
        }
        entity = entity.slice(0, offset);
        const index = hostnameIndex(`${entity}.*`);
        if (index !== -1) {
          addSelectorList(SELECTOR_LIST_REFS[index], selectors, exceptions);
        }
      }
    }
  }

  for (let index = 0; index + 2 < REGEXES.length; index += 3) {
    const needle = REGEXES[index];
    if (typeof needle !== "string" || !hostname.includes(needle)) {
      continue;
    }
    try {
      if (new RegExp(REGEXES[index + 1]).test(hostname)) {
        addSelectorList(REGEXES[index + 2], selectors, exceptions);
      }
    } catch {
      // Ignore an upstream regular expression unsupported by this JS engine.
    }
  }

  for (const selector of exceptions) {
    selectors.delete(selector);
  }
  return Array.from(selectors);
}

export function injectCss(html, selectors) {
  if (selectors.length === 0) {
    return html;
  }
  const marker = `data-egern-ubol="${RULESET_ID}"`;
  if (html.includes(marker)) {
    return html;
  }
  const css = `${selectors.join(",\n")}{display:none!important;}`;
  const style = `<style ${marker}>${css}</style>`;
  if (/<\/head\s*>/i.test(html)) {
    return html.replace(/<\/head\s*>/i, (closing) => style + closing);
  }
  if (/<body\b[^>]*>/i.test(html)) {
    return html.replace(/<body\b[^>]*>/i, (opening) => opening + style);
  }
  return style + html;
}

function responseContentType(ctx) {
  const headers = ctx.response?.headers;
  if (typeof headers?.get === "function") {
    return headers.get("content-type") || "";
  }
  return headers?.["content-type"] || headers?.["Content-Type"] || "";
}

export default async function (ctx) {
  if (ctx.env?.ENABLE_COSMETIC_FILTERING === "false") {
    return undefined;
  }
  if (!/(?:text\/html|application\/xhtml\+xml)/i.test(responseContentType(ctx))) {
    return undefined;
  }

  let parsed;
  try {
    parsed = new URL(ctx.request?.url);
  } catch {
    return undefined;
  }
  const selectors = selectorsForHostname(parsed.hostname);
  if (selectors.length === 0) {
    return undefined;
  }

  const html = await ctx.response.text();
  const body = injectCss(html, selectors);
  return body === html ? undefined : { body };
}
'''
    return (
        f"// Generated from official uBO Lite {source.version}.\n"
        "// Plain site-specific cosmetic selectors only; procedural rules are omitted.\n\n"
        + constants
        + runtime
    )


def effective_group(meta: dict[str, Any]) -> str:
    group = meta.get("group")
    return str(group) if group in GROUP_ORDER else "misc"


def load_selection(path: Path) -> ModulePreset:
    document = read_json(path)
    enabled = document.get("enabled")
    if not isinstance(enabled, list) or not all(isinstance(item, str) for item in enabled):
        raise RuntimeError(f"Invalid selection file: {path}")
    included_value = document.get("included")
    if included_value is not None and (
        not isinstance(included_value, list)
        or not all(isinstance(item, str) for item in included_value)
    ):
        raise RuntimeError(f"Invalid included list in selection file: {path}")
    module = document.get("module", {})
    if not isinstance(module, dict):
        raise RuntimeError(f"Invalid module settings in selection file: {path}")
    name = module.get("name", "uBlock Origin Lite 规则")
    description = module.get("description")
    icon = module.get("icon", "shield.lefthalf.filled")
    profile = module.get("profile")
    expose_list_switches = module.get("expose_list_switches", True)
    if not isinstance(name, str) or not name:
        raise RuntimeError(f"Invalid module name in selection file: {path}")
    if description is not None and not isinstance(description, str):
        raise RuntimeError(f"Invalid module description in selection file: {path}")
    if not isinstance(icon, str) or not icon:
        raise RuntimeError(f"Invalid module icon in selection file: {path}")
    if profile is not None and not isinstance(profile, str):
        raise RuntimeError(f"Invalid module profile in selection file: {path}")
    if not isinstance(expose_list_switches, bool):
        raise RuntimeError(f"Invalid module switch setting in selection file: {path}")
    return ModulePreset(
        enabled=frozenset(enabled),
        included=(
            frozenset(included_value) if included_value is not None else None
        ),
        name=name,
        description=description,
        icon=icon,
        profile=profile,
        expose_list_switches=expose_list_switches,
    )


def render_reference_example(
    base_url: str,
    include_specific_css: bool,
    has_query_scripts: bool,
    item_count: int,
    preset: ModulePreset,
) -> str:
    if base_url == ".":
        module_url = "./ubol.yaml"
    else:
        module_url = f"{base_url.rstrip('/')}/ubol.yaml"
    lines = [
        "# 将这一个模块引用添加到 Egern 主配置。",
        (
            f"# {item_count} 个列表开关已在 ubol.yaml 内定义。"
            if preset.expose_list_switches
            else f"# 模块固定启用 {item_count} 个精选列表，无额外列表开关。"
        ),
        "modules:",
        f"  - name: {yaml_quote(preset.name)}",
        f"    url: {yaml_quote(module_url)}",
        "    enabled: true",
        "    update_interval: 86400",
    ]
    if has_query_scripts or include_specific_css:
        lines.append("    env:")
        if has_query_scripts:
            lines.append(f"      ENABLE_QUERY_CLEANING: {yaml_quote('true')}")
        if include_specific_css:
            lines.append(f"      ENABLE_COSMETIC_FILTERING: {yaml_quote('true')}")
    return "\n".join(lines) + "\n"


def action_counts(rules: Sequence[dict[str, Any]]) -> dict[str, int]:
    counts = Counter(
        str(rule.get("action", {}).get("type", "unknown")) for rule in rules
    )
    return dict(sorted(counts.items()))


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def replace_directory(staging: Path, destination: Path) -> None:
    destination = destination.resolve()
    if destination == PROJECT_ROOT or destination == destination.parent:
        raise RuntimeError(f"Refusing to replace unsafe output path: {destination}")
    backup = destination.with_name(f".{destination.name}.previous")
    if backup.exists():
        shutil.rmtree(backup)
    try:
        if destination.exists():
            os.replace(destination, backup)
        os.replace(staging, destination)
    except Exception:
        if not destination.exists() and backup.exists():
            os.replace(backup, destination)
        raise
    if backup.exists():
        shutil.rmtree(backup)


def generate(
    extension_root: Path,
    source: SourceInfo,
    destination: Path,
    selection_path: Path,
    base_url: str,
    policy: str,
    include_url_regex: bool = False,
    include_specific_css: bool = False,
) -> dict[str, Any]:
    ruleset_root = extension_root / "rulesets"
    all_details: list[dict[str, Any]] = read_json(
        ruleset_root / "ruleset-details.json"
    )
    preset = load_selection(selection_path)
    enabled = set(preset.enabled)
    known_ids = {str(item["id"]) for item in all_details}
    included = set(preset.included) if preset.included is not None else known_ids
    unknown_ids = (enabled | included) - known_ids
    if unknown_ids:
        raise RuntimeError(
            "Selected uBO Lite list IDs are missing upstream: "
            + ", ".join(sorted(unknown_ids))
        )
    if not enabled <= included:
        raise RuntimeError("Enabled rulesets must also be included in the module")
    if not preset.expose_list_switches and enabled != included:
        raise RuntimeError(
            "A module without list switches must enable every included ruleset"
        )
    details = [item for item in all_details if str(item["id"]) in included]

    destination = destination.resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(
        tempfile.mkdtemp(prefix=f".{destination.name}-", dir=destination.parent)
    )

    report_items: list[dict[str, Any]] = []
    module_items: list[dict[str, Any]] = []
    total_actions: Counter[str] = Counter()
    total_output: Counter[str] = Counter()
    try:
        for item in details:
            id_value = str(item["id"])
            group = effective_group(item)
            rules = load_rules(ruleset_root, id_value)
            strictblock_rules = load_strictblock_rules(ruleset_root, id_value)
            network = convert_network_rules(
                rules,
                strictblock_rules=strictblock_rules,
                include_url_regex=include_url_regex,
            )
            query = convert_query_rules(rules)
            cosmetic = convert_specific_cosmetic_rules(
                ruleset_root,
                id_value,
                include_specific_css=include_specific_css,
            )
            counts = action_counts(rules)
            total_actions.update(counts)
            output_counts = {
                "domain_suffixes": len(network.domain_suffixes),
                "ipv4_cidrs": len(network.ipv4_cidrs),
                "ipv6_cidrs": len(network.ipv6_cidrs),
                "url_regexes": len(network.url_regexes),
                "query_operations": len(query.operations),
            }
            if include_specific_css:
                output_counts.update(
                    {
                        "cosmetic_selectors": len(cosmetic.selectors),
                        "cosmetic_hostnames": len(cosmetic.hostnames),
                        "cosmetic_regex_rules": len(cosmetic.regexes) // 3,
                        "cosmetic_scripts": int(
                            bool(cosmetic.hostnames or cosmetic.regexes)
                        ),
                    }
                )
            total_output.update(output_counts)

            write_text(
                staging / "rulesets" / f"{id_value}.yaml",
                render_ruleset(source, network),
            )
            if query.operations:
                write_text(
                    staging / "scripts" / f"{id_value}.js",
                    render_query_script(source, query.operations),
                )
            if cosmetic.hostnames or cosmetic.regexes:
                write_text(
                    staging / "cosmetic" / f"{id_value}.js",
                    render_cosmetic_script(source, id_value, cosmetic),
                )

            module_items.append(
                {
                    "meta": item,
                    "network": network,
                    "query": query,
                    "cosmetic": cosmetic,
                }
            )

            report_items.append(
                {
                    "id": id_value,
                    "name": item["name"],
                    "group": group,
                    "enabled_in_preset": id_value in enabled,
                    "enabled_upstream_by_default": bool(item.get("enabled", False)),
                    "homepage": item.get("homeURL"),
                    "input": {
                        "rules": len(rules),
                        "strictblock_rules": len(strictblock_rules),
                        "actions": counts,
                        "filters": item.get("filters", {}),
                        "css": item.get("css", {}),
                        "popups": item.get("popups", 0),
                    },
                    "output": {
                        "domain_suffixes": len(network.domain_suffixes),
                        "ipv4_cidrs": len(network.ipv4_cidrs),
                        "ipv6_cidrs": len(network.ipv6_cidrs),
                        "url_regexes": len(network.url_regexes),
                        "query_operations": len(query.operations),
                        "query_cleaning_sample": query.sample,
                        **(
                            {
                                "cosmetic_selectors": len(cosmetic.selectors),
                                "cosmetic_hostnames": len(cosmetic.hostnames),
                                "cosmetic_regex_rules": len(cosmetic.regexes) // 3,
                            }
                            if include_specific_css
                            else {}
                        ),
                    },
                    "network_conversion": network.stats,
                    "query_conversion": query.stats,
                    **(
                        {"cosmetic_conversion": cosmetic.stats}
                        if include_specific_css
                        else {}
                    ),
                }
            )

        if include_specific_css and "chn-0" in included:
            write_text(
                staging / "cosmetic" / "iplark-homepage-css.js",
                render_iplark_cosmetic_script(source),
            )

        write_text(
            staging / "ubol.yaml",
            render_combined_module(
                source=source,
                items=module_items,
                preset=preset,
                base_url=base_url,
                policy=policy,
                include_url_regex=include_url_regex,
                include_specific_css=include_specific_css,
            ),
        )
        write_text(
            staging / "config.example.yaml",
            render_reference_example(
                base_url=base_url,
                include_specific_css=include_specific_css,
                has_query_scripts=any(
                    item["query"].operations for item in module_items
                ),
                item_count=len(module_items),
                preset=preset,
            ),
        )
        write_text(staging / "VERSION", source.version + "\n")
        report = {
            "schema_version": 2 if include_specific_css else 1,
            "source": asdict(source),
            "base_url": base_url,
            "build_options": {
                "include_url_regex": include_url_regex,
                **(
                    {"include_specific_css": True}
                    if include_specific_css
                    else {}
                ),
                "profile": preset.profile
                or (
                    "full-url-css"
                    if include_specific_css
                    else "full-url"
                    if include_url_regex
                    else "memory-safe"
                ),
            },
            "preset": {
                "enabled": [
                    str(item["id"])
                    for item in details
                    if str(item["id"]) in enabled
                ],
                "enabled_count": len(enabled),
                "available_count": len(details),
                "expose_list_switches": preset.expose_list_switches,
                "module_name": preset.name,
            },
            "totals": {
                "input_rules": sum(item["input"]["rules"] for item in report_items),
                "input_actions": dict(sorted(total_actions.items())),
                **dict(sorted(total_output.items())),
            },
            "limitations": (
                [
                    "Plain site-specific cosmetic CSS is injected into HTML responses; generic selectors, procedural cosmetic filters, scriptlets, and popup handling are omitted.",
                    "HTTPS cosmetic filtering only runs for MITM-covered hostnames; the module adds iplark.com but never enables wildcard MITM.",
                ]
                if include_specific_css
                else [
                    "Cosmetic filters, scriptlets, popup handling, and strict-block UI are browser-only and are not emitted.",
                ]
            )
            + [
                "Block rules requiring initiator, first/third-party, resource-type, method, or header context are omitted.",
                "Allow-rule target domains are conservatively removed from native domain output to avoid unrepresentable exceptions.",
                "Extension-resource redirects and header modifications are omitted.",
                "Query cleaners omit initiator/domain-type conditions and require HTTPS MITM coverage in Egern to see encrypted URLs.",
                "The generated module never enables wildcard MITM automatically.",
            ],
            "rulesets": report_items,
        }
        write_text(
            staging / "metadata.json",
            json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        )
        replace_directory(staging, destination)
        return report
    except Exception:
        if staging.exists():
            shutil.rmtree(staging)
        raise


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group()
    source.add_argument(
        "--latest",
        action="store_true",
        help="download and verify the latest official uBO Lite Chromium release",
    )
    source.add_argument(
        "--extension-dir",
        type=Path,
        help="read an already extracted uBO Lite extension directory",
    )
    parser.add_argument(
        "--dist",
        type=Path,
        default=PROJECT_ROOT / "dist",
        help="generated artifact directory (default: %(default)s)",
    )
    parser.add_argument(
        "--selection",
        type=Path,
        default=PROJECT_ROOT / "config" / "selection.json",
        help="preset selection JSON (default: %(default)s)",
    )
    parser.add_argument(
        "--base-url",
        default=".",
        help="published dist URL; use '.' for relative local references",
    )
    parser.add_argument(
        "--policy",
        default="REJECT",
        help="default Egern block policy (default: %(default)s)",
    )
    parser.add_argument(
        "--include-url-regex",
        action="store_true",
        help=(
            "emit path-level URL regex rules; disabled by default to keep the "
            "iOS Network Extension memory footprint bounded"
        ),
    )
    parser.add_argument(
        "--include-specific-css",
        action="store_true",
        help=(
            "emit HTML response scripts for plain site-specific cosmetic CSS; "
            "HTTPS pages require matching Egern MITM coverage"
        ),
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    with tempfile.TemporaryDirectory(prefix="ubol-egern-source-") as temp:
        temp_root = Path(temp)
        if args.extension_dir:
            extension_root, source = source_from_local(args.extension_dir)
        elif args.latest:
            extension_root, source = download_latest_release(temp_root)
        else:
            installed = discover_installed_extension()
            if installed is None:
                extension_root, source = download_latest_release(temp_root)
            else:
                extension_root, source = source_from_local(installed)

        report = generate(
            extension_root=extension_root,
            source=source,
            destination=args.dist,
            selection_path=args.selection,
            base_url=args.base_url.rstrip("/") or ".",
            policy=args.policy,
            include_url_regex=args.include_url_regex,
            include_specific_css=args.include_specific_css,
        )

    totals = report["totals"]
    preset = report["preset"]
    list_mode = (
        f"{preset['available_count']} list switches"
        if preset["expose_list_switches"]
        else f"{preset['available_count']} fixed rulesets"
    )
    print(
        f"Generated one module with {list_mode} from uBO Lite "
        f"{report['source']['version']}: {totals['domain_suffixes']} domains, "
        f"{totals['url_regexes']} URL rules, "
        f"{totals['query_operations']} query cleaners, "
        f"{totals.get('cosmetic_selectors', 0)} cosmetic selectors."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
