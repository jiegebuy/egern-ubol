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
    def test_surge_modules_are_the_primary_import_format(self) -> None:
        for name in ("BiliBili.ADBlock.sgmodule", "BiliBili.Enhanced.sgmodule"):
            with self.subTest(name=name):
                source = (BILIBILI / name).read_text(encoding="utf-8")
                self.assertIn("[Script]", source)
                self.assertIn("[MITM]", source)
                self.assertNotIn("{{{", source.split("#!arguments-desc", 1)[0])

    def test_surge_adblock_keeps_pause_and_extra_feed_rules(self) -> None:
        source = (BILIBILI / "BiliBili.ADBlock.sgmodule").read_text(encoding="utf-8")
        self.assertIn("cm\\.bili(bili\\.com|api\\.net)", source)
        self.assertIn("pause_page", source)
        self.assertIn("grpc\\.bili(bili\\.com|api\\.net)", source)
        self.assertIn('data-type=text data="{\\"code\\":0', source)
        map_pattern = next(
            line.split(" data-type=", 1)[0]
            for line in source.splitlines()
            if "pause_page" in line and "data-type=" in line
        )
        grpc_pattern = next(
            line.rsplit(" - reject", 1)[0]
            for line in source.splitlines()
            if "grpc\\.bili" in line and "pause_page" in line
        )
        self.assertRegex(
            "https://app.bilibili.com/x/v2/view/Paused_Page?aid=1", map_pattern
        )
        self.assertRegex(
            "https://grpc.bilibili.com/bilibili.ad.v1.PausedPage/RequestPausedPage",
            grpc_pattern,
        )
        self.assertIn("Feed.Filter", source)
        self.assertIn("feed-filter.compat.js", source)

    def test_surge_enhanced_purifies_share_short_links(self) -> None:
        source = (BILIBILI / "BiliBili.Enhanced.sgmodule").read_text(encoding="utf-8")
        self.assertIn("Share.Purify:true", source)
        self.assertIn("Share.BV2AV:false", source)
        self.assertIn("/x\\/share\\/click", source)
        self.assertIn("share-link-purify.compat.js", source)
        self.assertIn("api.bilibili.com", source)
        self.assertIn("api.biliapi.net", source)

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
