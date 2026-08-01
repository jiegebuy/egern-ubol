from __future__ import annotations

import json
import re
import sys
import unittest
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.update import (  # noqa: E402
    DOCUMENT_RESPONSE_MATCH,
    RULESET_UI,
    argument_key,
    minimize_domains,
    switch_key,
    url_filter_to_regex,
)


EXPECTED_ENABLED = {
    "ublock-filters",
    "easylist",
    "easyprivacy",
    "pgl",
    "adguard-spyware-url",
    "ublock-badware",
    "urlhaus-full",
    "annoyances-ai",
    "chn-0",
}


def load_module_after_substitution(path: Path) -> tuple[dict, dict]:
    source = path.read_text(encoding="utf-8")
    compat_source = source.split("compat_arguments_desc:", 1)[0]
    defaults = yaml.safe_load(compat_source)["compat_arguments"]
    substituted = source
    for key, value in defaults.items():
        if isinstance(value, bool):
            replacement = "true" if value else "false"
        else:
            replacement = str(value)
        substituted = substituted.replace("{{{" + key + "}}}", replacement)
    return yaml.safe_load(substituted), defaults


class UrlFilterTests(unittest.TestCase):
    def assert_matches(self, value: str, url: str) -> None:
        self.assertRegex(url, re.compile(url_filter_to_regex(value), re.IGNORECASE))

    def assert_not_matches(self, value: str, url: str) -> None:
        self.assertIsNone(
            re.search(url_filter_to_regex(value), url, flags=re.IGNORECASE)
        )

    def test_domain_anchor(self) -> None:
        self.assert_matches("||example.com^", "https://cdn.example.com/script.js")
        self.assert_not_matches("||example.com^", "https://fakeexample.com/script.js")

    def test_wildcard_and_separator(self) -> None:
        self.assert_matches(
            "||amazon.*/dp/*^ref_=",
            "https://www.amazon.com/dp/ABC?ref_=sample",
        )

    def test_left_and_right_anchor(self) -> None:
        self.assert_matches("|https://example.com/path|", "https://example.com/path")
        self.assert_not_matches(
            "|https://example.com/path|", "https://example.com/path/more"
        )

    def test_cosmetic_script_match_targets_documents_not_static_assets(self) -> None:
        self.assertRegex("https://iplark.com/", DOCUMENT_RESPONSE_MATCH)
        self.assertRegex("https://example.com/article", DOCUMENT_RESPONSE_MATCH)
        self.assertRegex("https://example.com/a.html?x=1", DOCUMENT_RESPONSE_MATCH)
        self.assertNotRegex("https://example.com/static/app.js", DOCUMENT_RESPONSE_MATCH)


class DomainMinimizationTests(unittest.TestCase):
    def test_parent_domain_covers_children(self) -> None:
        self.assertEqual(
            minimize_domains(["ads.example.com", "example.com", "other.test"]),
            ["example.com", "other.test"],
        )

    def test_switch_keys_are_stable(self) -> None:
        self.assertEqual(switch_key("chn-0"), "DISABLE_CHN_0")
        self.assertEqual(
            switch_key("adguard-spyware-url"), "DISABLE_ADGUARD_SPYWARE_URL"
        )

    def test_user_facing_argument_keys_are_readable_and_unique(self) -> None:
        labels = [entry[0] for entry in RULESET_UI.values()]
        self.assertEqual(len(labels), 56)
        self.assertEqual(len(set(labels)), 56)
        self.assertEqual(argument_key("easylist"), "禁用EasyList")
        self.assertEqual(argument_key("chn-0"), "禁用AdGuard中文")


class GeneratedArtifactTests(unittest.TestCase):
    def profile(self, name: str) -> tuple[Path, dict, dict, dict]:
        root = ROOT / "dist" / name
        metadata = json.loads((root / "metadata.json").read_text(encoding="utf-8"))
        module, defaults = load_module_after_substitution(root / "ubol.yaml")
        return root, metadata, module, defaults

    def test_both_profiles_have_one_module_and_56_switches(self) -> None:
        for profile_name in ("memory-safe", "full"):
            with self.subTest(profile=profile_name):
                root, metadata, module, defaults = self.profile(profile_name)
                self.assertEqual(metadata["preset"]["available_count"], 56)
                self.assertEqual(len(module["rules"]), 56)
                self.assertEqual(len(defaults), 57)  # policy plus 56 booleans
                if profile_name == "memory-safe":
                    self.assertNotIn("mitm", module)
                else:
                    self.assertEqual(
                        module["mitm"]["hostnames"]["includes"],
                        ["iplark.com", "*.iplark.com"],
                    )
                self.assertTrue((root / "config.example.yaml").is_file())

    def test_module_editor_text_is_localized_and_uses_list_names(self) -> None:
        for profile_name in ("memory-safe", "full"):
            with self.subTest(profile=profile_name):
                root, _, module, defaults = self.profile(profile_name)
                source = (root / "ubol.yaml").read_text(encoding="utf-8")
                self.assertEqual(module["name"], "uBlock Origin Lite 规则")
                self.assertIn("所有“禁用…”参数", module["compat_arguments_desc"])
                self.assertIn("EasyList/uBO – Cookie Notices", source)
                self.assertIn("禁用EasyList", defaults)
                self.assertIn("禁用AdGuard中文", defaults)
                self.assertNotIn("DISABLE_EASYLIST", defaults)
                self.assertEqual(
                    module["env_schema"]["ENABLE_QUERY_CLEANING"]["name"],
                    "URL 查询参数清理",
                )
                if profile_name == "full":
                    self.assertEqual(
                        module["env_schema"]["ENABLE_COSMETIC_FILTERING"]["name"],
                        "Safari 网页元素隐藏",
                    )

    def test_preset_defaults_match_requested_selection(self) -> None:
        _, metadata, module, defaults = self.profile("memory-safe")
        selected = set(metadata["preset"]["enabled"])
        self.assertEqual(selected, EXPECTED_ENABLED)
        disabled_values = [entry["rule_set"]["disabled"] for entry in module["rules"]]
        self.assertEqual(disabled_values.count(False), len(EXPECTED_ENABLED))
        for ruleset_id in EXPECTED_ENABLED:
            self.assertFalse(defaults[argument_key(ruleset_id)])

    def test_profile_rule_counts(self) -> None:
        _, memory, _, _ = self.profile("memory-safe")
        _, full, _, _ = self.profile("full")
        self.assertEqual(memory["build_options"]["profile"], "memory-safe")
        self.assertEqual(memory["totals"]["url_regexes"], 0)
        self.assertEqual(full["build_options"]["profile"], "full-url-css")
        self.assertTrue(full["build_options"]["include_specific_css"])
        self.assertGreater(full["totals"]["url_regexes"], 40_000)
        self.assertGreater(full["totals"]["cosmetic_selectors"], 50_000)
        self.assertEqual(
            memory["totals"]["domain_suffixes"],
            full["totals"]["domain_suffixes"],
        )

    def test_referenced_artifacts_exist(self) -> None:
        for profile_name in ("memory-safe", "full"):
            root, metadata, module, _ = self.profile(profile_name)
            for entry in module["rules"]:
                url = entry["rule_set"]["match"]
                self.assertIn(f"/dist/{profile_name}/rulesets/", url)
                self.assertTrue((root / "rulesets" / Path(url).name).is_file())
            for entry in module.get("scriptings", []):
                if "http_request" in entry:
                    url = entry["http_request"]["script_url"]
                    self.assertIn(f"/dist/{profile_name}/scripts/", url)
                    self.assertTrue((root / "scripts" / Path(url).name).is_file())
                else:
                    url = entry["http_response"]["script_url"]
                    self.assertEqual(profile_name, "full")
                    self.assertIn(f"/dist/{profile_name}/cosmetic/", url)
                    self.assertTrue((root / "cosmetic" / Path(url).name).is_file())
            self.assertEqual(len(metadata["rulesets"]), 56)

    def test_full_profile_has_targeted_iplark_cosmetic_bridge(self) -> None:
        root, metadata, module, _ = self.profile("full")
        chinese = next(
            item for item in metadata["rulesets"] if item["id"] == "chn-0"
        )
        self.assertGreater(chinese["output"]["cosmetic_selectors"], 1_000)
        self.assertTrue((root / "cosmetic" / "chn-0.js").is_file())
        self.assertNotIn("*", module["mitm"]["hostnames"]["includes"])

    def test_memory_profile_stays_compact(self) -> None:
        root, metadata, _, _ = self.profile("memory-safe")
        artifact_bytes = sum(
            path.stat().st_size for path in root.rglob("*") if path.is_file()
        )
        self.assertLess(artifact_bytes, 5 * 1024 * 1024)
        badware = next(
            item for item in metadata["rulesets"] if item["id"] == "ublock-badware"
        )
        self.assertGreater(badware["output"]["domain_suffixes"], 1_000)


if __name__ == "__main__":
    unittest.main()
