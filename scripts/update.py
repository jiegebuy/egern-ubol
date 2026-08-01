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
    "default": "Default",
    "ads": "Ads",
    "privacy": "Privacy",
    "malware": "Malware protection, security",
    "annoyances": "Annoyances",
    "misc": "Miscellaneous",
    "regions": "Regions, languages",
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


def render_combined_module(
    source: SourceInfo,
    items: Sequence[dict[str, Any]],
    enabled: set[str],
    base_url: str,
    policy: str,
    include_url_regex: bool,
) -> str:
    profile = "full URL" if include_url_regex else "memory-safe domain/IP"
    lines = [
        f"name: {yaml_quote('uBlock Origin Lite rules')}",
        "description: "
        + yaml_quote(
            f"One Egern module with {len(items)} independently configurable "
            f"uBO Lite {source.version} filter-list switches ({profile} profile)."
        ),
        f"author: {yaml_quote('Raymond Hill and upstream filter-list maintainers')}",
        f"homepage: {yaml_quote(UPSTREAM_HOME)}",
        f"manual: {yaml_quote(UPSTREAM_HOME)}",
        f"icon: {yaml_quote('shield.lefthalf.filled')}",
        "",
        "compat_arguments:",
        f"  BLOCK_POLICY: {yaml_quote(policy)}",
    ]
    for item in items:
        id_value = str(item["meta"]["id"])
        lines.append(
            f"  {switch_key(id_value)}: {'false' if id_value in enabled else 'true'}"
        )

    lines.extend(
        [
            "compat_arguments_desc: |",
            "  Set a DISABLE_* boolean to false to enable that list, or true to disable it.",
            "  BLOCK_POLICY controls the Egern policy used by all enabled lists.",
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
            lines.append(f"  {switch_key(str(meta['id']))}: {meta['name']}")

    if any(item["query"].operations for item in items):
        lines.extend(
            [
                "",
                "env_schema:",
                "  ENABLE_QUERY_CLEANING:",
                f"    name: {yaml_quote('URL query cleaning')}",
                "    description: "
                + yaml_quote(
                    "Disable only query-parameter cleaning; native blocking stays enabled."
                ),
                f"    default_value: {yaml_quote('true')}",
                "    options:",
                f"      - {yaml_quote('true')}",
                f"      - {yaml_quote('false')}",
            ]
        )

    lines.extend(["", "rules:"])
    for item in items:
        meta = item["meta"]
        id_value = str(meta["id"])
        lines.extend(
            [
                "  - rule_set:",
                f"      name: {yaml_quote(str(meta['name']))}",
                "      match: "
                + yaml_quote(
                    relative_or_remote(base_url, "rulesets", f"{id_value}.yaml")
                ),
                f"      policy: {yaml_quote('{{{BLOCK_POLICY}}}')}",
                "      update_interval: 86400",
                "      disabled: {{{" + switch_key(id_value) + "}}}",
            ]
        )

    query_items = [item for item in items if item["query"].operations]
    if query_items:
        lines.extend(["", "scriptings:"])
        for item in query_items:
            meta = item["meta"]
            id_value = str(meta["id"])
            lines.extend(
                [
                    "  - http_request:",
                    f"      name: {yaml_quote(str(meta['name']) + ' - query cleaner')}",
                    f"      match: {yaml_quote('^https?://')}",
                    "      script_url: "
                    + yaml_quote(
                        relative_or_remote(base_url, "scripts", f"{id_value}.js")
                    ),
                    "      update_interval: 86400",
                    "      timeout: 5",
                    "      disabled: {{{" + switch_key(id_value) + "}}}",
                ]
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


def effective_group(meta: dict[str, Any]) -> str:
    group = meta.get("group")
    return str(group) if group in GROUP_ORDER else "misc"


def load_selection(path: Path) -> set[str]:
    document = read_json(path)
    enabled = document.get("enabled")
    if not isinstance(enabled, list) or not all(isinstance(item, str) for item in enabled):
        raise RuntimeError(f"Invalid selection file: {path}")
    return set(enabled)


def render_reference_example(base_url: str) -> str:
    if base_url == ".":
        module_url = "./ubol.yaml"
    else:
        module_url = f"{base_url.rstrip('/')}/ubol.yaml"
    return "\n".join(
        [
            "# Add this single module reference to the Egern main configuration.",
            "# Its 56 boolean compat_arguments are defined inside ubol.yaml.",
            "modules:",
            f"  - name: {yaml_quote('uBlock Origin Lite rules')}",
            f"    url: {yaml_quote(module_url)}",
            "    enabled: true",
            "    update_interval: 86400",
            "    env:",
            f"      ENABLE_QUERY_CLEANING: {yaml_quote('true')}",
        ]
    ) + "\n"


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
) -> dict[str, Any]:
    ruleset_root = extension_root / "rulesets"
    details: list[dict[str, Any]] = read_json(ruleset_root / "ruleset-details.json")
    enabled = load_selection(selection_path)
    known_ids = {str(item["id"]) for item in details}
    unknown_ids = enabled - known_ids
    if unknown_ids:
        raise RuntimeError(
            "Selected uBO Lite list IDs are missing upstream: "
            + ", ".join(sorted(unknown_ids))
        )

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
            counts = action_counts(rules)
            total_actions.update(counts)
            total_output.update(
                {
                    "domain_suffixes": len(network.domain_suffixes),
                    "ipv4_cidrs": len(network.ipv4_cidrs),
                    "ipv6_cidrs": len(network.ipv6_cidrs),
                    "url_regexes": len(network.url_regexes),
                    "query_operations": len(query.operations),
                }
            )

            write_text(
                staging / "rulesets" / f"{id_value}.yaml",
                render_ruleset(source, network),
            )
            if query.operations:
                write_text(
                    staging / "scripts" / f"{id_value}.js",
                    render_query_script(source, query.operations),
                )

            module_items.append(
                {
                    "meta": item,
                    "network": network,
                    "query": query,
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
                    },
                    "network_conversion": network.stats,
                    "query_conversion": query.stats,
                }
            )

        write_text(
            staging / "ubol.yaml",
            render_combined_module(
                source=source,
                items=module_items,
                enabled=enabled,
                base_url=base_url,
                policy=policy,
                include_url_regex=include_url_regex,
            ),
        )
        write_text(
            staging / "config.example.yaml", render_reference_example(base_url)
        )
        write_text(staging / "VERSION", source.version + "\n")
        report = {
            "schema_version": 1,
            "source": asdict(source),
            "base_url": base_url,
            "build_options": {
                "include_url_regex": include_url_regex,
                "profile": "full-url" if include_url_regex else "memory-safe",
            },
            "preset": {
                "enabled": [
                    str(item["id"])
                    for item in details
                    if str(item["id"]) in enabled
                ],
                "enabled_count": len(enabled),
                "available_count": len(details),
            },
            "totals": {
                "input_rules": sum(item["input"]["rules"] for item in report_items),
                "input_actions": dict(sorted(total_actions.items())),
                **dict(sorted(total_output.items())),
            },
            "limitations": [
                "Cosmetic filters, scriptlets, popup handling, and strict-block UI are browser-only and are not emitted.",
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
        )

    totals = report["totals"]
    print(
        f"Generated one module with {report['preset']['available_count']} list switches from uBO Lite "
        f"{report['source']['version']}: {totals['domain_suffixes']} domains, "
        f"{totals['url_regexes']} URL rules, "
        f"{totals['query_operations']} query cleaners."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
