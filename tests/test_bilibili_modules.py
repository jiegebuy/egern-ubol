from __future__ import annotations

import re
import unittest
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
BILIBILI = ROOT / "bilibili"


def load_module(path: Path) -> dict:
    source = path.read_text(encoding="utf-8")
    defaults = yaml.safe_load(source.split("compat_arguments_desc:", 1)[0])[
        "compat_arguments"
    ]
    for key, value in defaults.items():
        source = source.replace("{{{" + key + "}}}", str(value))
    return yaml.safe_load(source)


class BiliBiliModuleTests(unittest.TestCase):
    def test_modules_are_valid_yaml_after_argument_substitution(self) -> None:
        for name in ("BiliBili.ADBlock.yaml", "BiliBili.Enhanced.yaml"):
            with self.subTest(name=name):
                module = load_module(BILIBILI / name)
                self.assertIsInstance(module["scriptings"], list)
                self.assertTrue(module["mitm"]["hostnames"]["includes"])

    def test_compat_argument_names_use_egern_safe_identifiers(self) -> None:
        for name in ("BiliBili.ADBlock.yaml", "BiliBili.Enhanced.yaml"):
            with self.subTest(name=name):
                source = (BILIBILI / name).read_text(encoding="utf-8")
                module = yaml.safe_load(source)
                self.assertTrue(
                    all(re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", key) for key in module["compat_arguments"])
                )
                placeholders = set(re.findall(r"\{\{\{([^}]+)\}\}\}", source))
                self.assertLessEqual(placeholders, set(module["compat_arguments"]))

    def test_adblock_has_explicit_pause_ad_protection(self) -> None:
        module = load_module(BILIBILI / "BiliBili.ADBlock.yaml")
        rejected = {
            rule["domain"]["match"]
            for rule in module["rules"]
            if "domain" in rule
        }
        self.assertEqual(rejected, {"cm.bilibili.com", "cm.biliapi.net"})
        request_matches = [
            item["http_request"]["match"]
            for item in module["scriptings"]
            if "http_request" in item
        ]
        self.assertTrue(
            any(re.search(pattern, "https://app.bilibili.com/x/player/pause_ad?") for pattern in request_matches)
        )

    def test_adblock_binary_handlers_request_binary_bodies(self) -> None:
        module = load_module(BILIBILI / "BiliBili.ADBlock.yaml")
        binary = [
            item["http_response"]
            for item in module["scriptings"]
            if item.get("http_response", {}).get("binary_body")
        ]
        self.assertGreaterEqual(len(binary), 7)
        self.assertTrue(all(item["body_required"] for item in binary))


if __name__ == "__main__":
    unittest.main()
