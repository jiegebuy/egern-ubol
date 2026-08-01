from __future__ import annotations

import json
import re
import sys
import unittest
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.update import minimize_domains, switch_key, url_filter_to_regex  # noqa: E402


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
                self.assertNotIn("mitm", module)
                self.assertTrue((root / "config.example.yaml").is_file())

    def test_preset_defaults_match_requested_selection(self) -> None:
        _, metadata, module, defaults = self.profile("memory-safe")
        selected = set(metadata["preset"]["enabled"])
        self.assertEqual(selected, EXPECTED_ENABLED)
        disabled_values = [entry["rule_set"]["disabled"] for entry in module["rules"]]
        self.assertEqual(disabled_values.count(False), len(EXPECTED_ENABLED))
        for ruleset_id in EXPECTED_ENABLED:
            self.assertFalse(defaults[switch_key(ruleset_id)])

    def test_profile_rule_counts(self) -> None:
        _, memory, _, _ = self.profile("memory-safe")
        _, full, _, _ = self.profile("full")
        self.assertEqual(memory["build_options"]["profile"], "memory-safe")
        self.assertEqual(memory["totals"]["url_regexes"], 0)
        self.assertEqual(full["build_options"]["profile"], "full-url")
        self.assertGreater(full["totals"]["url_regexes"], 40_000)
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
                url = entry["http_request"]["script_url"]
                self.assertIn(f"/dist/{profile_name}/scripts/", url)
                self.assertTrue((root / "scripts" / Path(url).name).is_file())
            self.assertEqual(len(metadata["rulesets"]), 56)

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
