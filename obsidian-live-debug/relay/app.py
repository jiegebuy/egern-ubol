#!/usr/bin/env python3
"""Constrained WSS/HTTP relay for the Obsidian LiveDebug plugin."""
import asyncio, json, logging, os, secrets, time
from collections import deque
from aiohttp import web

DEVICE_TOKEN = os.environ.get("OBSIDIAN_LIVEDEBUG_DEVICE_TOKEN", "")
CONTROL_TOKEN = os.environ.get("OBSIDIAN_LIVEDEBUG_CONTROL_TOKEN", "")
MAX_EVENTS = 500
devices = {}
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
logger = logging.getLogger("obsidian-livedebug")

def bearer(request):
    value = request.headers.get("Authorization", "")
    return value[7:] if value.startswith("Bearer ") else ""

def control_required(request):
    return bool(CONTROL_TOKEN) and secrets.compare_digest(bearer(request), CONTROL_TOKEN)

def json_error(message, status=400):
    return web.json_response({"ok": False, "error": message}, status=status)

async def health(_):
    return web.json_response({"ok": True, "service": "obsidian-livedebug-relay", "time": time.time()})

async def list_devices(request):
    if not control_required(request): return json_error("unauthorized", 401)
    return web.json_response({"devices": [{"id": d["id"], "connected": d["ws"].closed is False, "lastSeen": d["last_seen"], "client": d.get("client", {})} for d in devices.values()]})

async def get_device(request):
    if not control_required(request): return json_error("unauthorized", 401)
    d = devices.get(request.match_info["device_id"])
    if not d: return json_error("device_not_found", 404)
    return web.json_response({"id": d["id"], "connected": not d["ws"].closed, "lastSeen": d["last_seen"], "client": d.get("client", {})})

async def rpc(request):
    if not control_required(request): return json_error("unauthorized", 401)
    d = devices.get(request.match_info["device_id"])
    if not d or d["ws"].closed: return json_error("device_offline", 409)
    body = await request.json()
    method = body.get("method")
    if not isinstance(method, str) or method not in {"system.ping", "diagnostics.snapshot", "plugins.list", "plugin.inspect", "logs.tail", "events.tail", "vault.summary", "network.probe", "commands.execute", "plugin.reload"}:
        return json_error("method_not_allowed", 403)
    request_id = secrets.token_urlsafe(12)
    future = asyncio.get_running_loop().create_future()
    d["pending"][request_id] = future
    await d["ws"].send_json({"type": "rpc", "id": request_id, "method": method, "params": body.get("params") or {}})
    try:
        result = await asyncio.wait_for(future, timeout=20)
        return web.json_response(result)
    except asyncio.TimeoutError:
        d["pending"].pop(request_id, None)
        return json_error("rpc_timeout", 504)
    except RuntimeError:
        d["pending"].pop(request_id, None)
        return json_error("device_disconnected", 409)

async def events(request):
    if not control_required(request): return json_error("unauthorized", 401)
    d = devices.get(request.match_info["device_id"])
    if not d: return json_error("device_not_found", 404)
    try: limit = min(500, max(1, int(request.query.get("limit", "100"))))
    except ValueError: limit = 100
    return web.json_response({"events": list(d["events"])[-limit:]})

async def event_stream(request):
    if not control_required(request): return json_error("unauthorized", 401)
    d = devices.get(request.match_info["device_id"])
    if not d: return json_error("device_not_found", 404)
    response = web.StreamResponse(status=200, headers={"Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive"})
    await response.prepare(request)
    queue = asyncio.Queue(maxsize=100)
    d["subscribers"].add(queue)
    try:
        await response.write(b": connected\n\n")
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=25)
                payload = json.dumps(event, ensure_ascii=False, separators=(",", ":"))
                await response.write(("data: " + payload + "\n\n").encode("utf-8"))
            except asyncio.TimeoutError:
                await response.write(b": keepalive\n\n")
    except (ConnectionResetError, asyncio.CancelledError):
        return response
    finally:
        d["subscribers"].discard(queue)

async def device_ws(request):
    protocols = request.headers.get("Sec-WebSocket-Protocol", "")
    values = [p.strip() for p in protocols.split(",")]
    token = next((p[13:] for p in values if p.startswith("device-token.")), "")
    if not DEVICE_TOKEN or not secrets.compare_digest(token, DEVICE_TOKEN): return json_error("unauthorized", 401)
    ws = web.WebSocketResponse(protocols=["obsidian-livedebug-v1"]); await ws.prepare(request)
    try:
        hello = await ws.receive_json(timeout=10)
    except Exception:
        logger.exception("device hello failed")
        await ws.close(code=1008, message=b"hello required")
        return ws
    if hello.get("type") != "hello" or not isinstance(hello.get("deviceId"), str): await ws.close(code=1008, message=b"hello required"); return ws
    device_id = hello["deviceId"]
    old = devices.get(device_id)
    if old and not old["ws"].closed: await old["ws"].close(code=1000, message=b"replaced")
    d = {"id": device_id, "ws": ws, "pending": {}, "events": deque(maxlen=MAX_EVENTS), "subscribers": set(), "last_seen": time.time(), "client": hello.get("client", {})}
    devices[device_id] = d
    await ws.send_json({"type": "ready", "deviceId": device_id})
    try:
        async for msg in ws:
            d["last_seen"] = time.time()
            if msg.type == web.WSMsgType.TEXT:
                try: data = json.loads(msg.data)
                except json.JSONDecodeError: continue
                if data.get("type") == "rpc.result" and data.get("id") in d["pending"]:
                    d["pending"].pop(data["id"]).set_result(data)
                elif data.get("type") == "event" and isinstance(data.get("event"), dict):
                    event = data["event"]
                    d["events"].append(event)
                    for queue in tuple(d["subscribers"]):
                        try: queue.put_nowait(event)
                        except asyncio.QueueFull: pass
            elif msg.type in (web.WSMsgType.ERROR, web.WSMsgType.CLOSE): break
    except Exception:
        logger.exception("device websocket failed")
    finally:
        for future in d["pending"].values():
            if not future.done(): future.set_exception(RuntimeError("device_disconnected"))
        if devices.get(device_id) is d: devices.pop(device_id, None)
    return ws

def create_app():
    application = web.Application()
    application.add_routes([
        web.get("/health", health),
        web.get("/api/v1/devices", list_devices),
        web.get("/api/v1/devices/{device_id}", get_device),
        web.post("/api/v1/devices/{device_id}/rpc", rpc),
        web.get("/api/v1/devices/{device_id}/events", events),
        web.get("/api/v1/devices/{device_id}/events/stream", event_stream),
        web.get("/ws/device", device_ws),
    ])
    return application

app = create_app()

if __name__ == "__main__":
    web.run_app(app, host=os.environ.get("LISTEN_HOST", "127.0.0.1"), port=int(os.environ.get("LISTEN_PORT", "8765")))
