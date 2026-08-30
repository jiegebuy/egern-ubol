import asyncio
import importlib
import os
import sys
import unittest
from pathlib import Path

from aiohttp.test_utils import TestClient, TestServer

RELAY_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RELAY_DIR))
relay = importlib.import_module("app")


class RelayTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        relay.DEVICE_TOKEN = "device-secret"
        relay.CONTROL_TOKEN = "control-secret"
        relay.devices.clear()
        self.client = TestClient(TestServer(relay.create_app()))
        await self.client.start_server()
        self.auth = {"Authorization": "Bearer control-secret"}

    async def asyncTearDown(self):
        for device in list(relay.devices.values()):
            await device["ws"].close()
        relay.devices.clear()
        await self.client.close()

    async def connect_device(self, device_id="ios-test"):
        ws = await self.client.ws_connect(
            "/ws/device",
            protocols=["obsidian-livedebug-v1", "device-token.device-secret"],
        )
        await ws.send_json({"type": "hello", "deviceId": device_id, "client": {"platform": "mobile"}})
        ready = await ws.receive_json()
        self.assertEqual(ready["type"], "ready")
        return ws

    async def test_control_api_rejects_missing_bearer(self):
        response = await self.client.get("/api/v1/devices")
        self.assertEqual(response.status, 401)

    async def test_device_rejects_wrong_token(self):
        response = await self.client.get(
            "/ws/device",
            headers={"Sec-WebSocket-Protocol": "obsidian-livedebug-v1, device-token.wrong"},
        )
        self.assertEqual(response.status, 401)

    async def test_rpc_round_trip(self):
        ws = await self.connect_device()
        request_task = asyncio.create_task(
            self.client.post(
                "/api/v1/devices/ios-test/rpc",
                headers=self.auth,
                json={"method": "diagnostics.snapshot"},
            )
        )
        rpc_message = await ws.receive_json()
        self.assertEqual(rpc_message["type"], "rpc")
        await ws.send_json({"type": "rpc.result", "id": rpc_message["id"], "ok": True, "result": {"foreground": True}})
        response = await request_task
        self.assertEqual(response.status, 200)
        self.assertEqual((await response.json())["result"]["foreground"], True)

    async def test_method_allowlist_blocks_unknown_rpc(self):
        await self.connect_device()
        response = await self.client.post(
            "/api/v1/devices/ios-test/rpc",
            headers=self.auth,
            json={"method": "javascript.eval"},
        )
        self.assertEqual(response.status, 403)

    async def test_event_buffer(self):
        ws = await self.connect_device()
        await ws.send_json({"type": "event", "event": {"type": "vault.modify", "at": "now"}})
        for _ in range(20):
            response = await self.client.get("/api/v1/devices/ios-test/events", headers=self.auth)
            payload = await response.json()
            if payload["events"]:
                break
            await asyncio.sleep(0.01)
        self.assertEqual(payload["events"][0]["type"], "vault.modify")


if __name__ == "__main__":
    unittest.main()
