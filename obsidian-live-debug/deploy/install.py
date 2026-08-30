#!/usr/bin/env python3
"""Idempotent root installer for the Obsidian LiveDebug relay."""
import json
import os
import pathlib
import re
import secrets
import shutil
import stat
import subprocess
import sys
import time

SOURCE = pathlib.Path(__file__).resolve().parents[1]
OPT = pathlib.Path("/opt/obsidian-live-debug")
RELAY = OPT / "relay"
ENV_FILE = pathlib.Path("/etc/obsidian-live-debug.env")
SERVICE_FILE = pathlib.Path("/etc/systemd/system/obsidian-live-debug.service")
NGINX_LINK = pathlib.Path("/etc/nginx/sites-enabled/obsidian-livesync")
PLUGIN_SETTINGS = OPT / "device-settings.json"
LOCATION = '''
    # obsidian-livedebug-managed
    location ^~ /obsidian-debug/ {
        proxy_pass http://127.0.0.1:8765/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

'''


def run(*args):
    subprocess.run(args, check=True)


def read_env():
    values = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                values[key] = value
    return values


def ensure_user():
    result = subprocess.run(["id", "-u", "obsidian-debug"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if result.returncode != 0:
        run("useradd", "--system", "--home", str(OPT), "--shell", "/usr/sbin/nologin", "obsidian-debug")


def install_files():
    RELAY.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE / "relay" / "app.py", RELAY / "app.py")
    shutil.copy2(SOURCE / "relay" / "requirements.txt", RELAY / "requirements.txt")
    shutil.copy2(SOURCE / "deploy" / "obsidian-live-debug.service", SERVICE_FILE)
    run("chown", "-R", "obsidian-debug:obsidian-debug", str(OPT))
    venv_python = OPT / "venv" / "bin" / "python"
    venv_pip = OPT / "venv" / "bin" / "pip"
    if not venv_python.exists() or not venv_pip.exists():
        if (OPT / "venv").exists():
            shutil.rmtree(OPT / "venv")
        run("python3", "-m", "venv", str(OPT / "venv"))
    run(str(venv_pip), "install", "--disable-pip-version-check", "-r", str(RELAY / "requirements.txt"))


def ensure_secrets():
    values = read_env()
    values.setdefault("OBSIDIAN_LIVEDEBUG_DEVICE_TOKEN", secrets.token_urlsafe(32))
    values.setdefault("OBSIDIAN_LIVEDEBUG_CONTROL_TOKEN", secrets.token_urlsafe(32))
    values.setdefault("LISTEN_HOST", "127.0.0.1")
    values.setdefault("LISTEN_PORT", "8765")
    ENV_FILE.write_text("".join(f"{key}={value}\n" for key, value in values.items()), encoding="utf-8")
    ENV_FILE.chmod(stat.S_IRUSR | stat.S_IWUSR)
    settings = {
        "relayUrl": "wss://sync.caeluses.com/obsidian-debug/ws/device",
        "deviceId": "ios-kyojuro",
        "deviceToken": values["OBSIDIAN_LIVEDEBUG_DEVICE_TOKEN"],
        "autoConnect": True,
        "allowControlledActions": False,
        "captureConsole": True,
        "allowedCommandIds": [],
        "allowedProbeHosts": ["sync.caeluses.com"],
        "eventBufferSize": 200,
    }
    PLUGIN_SETTINGS.write_text(json.dumps(settings, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    PLUGIN_SETTINGS.chmod(stat.S_IRUSR | stat.S_IWUSR)


def install_nginx_location():
    target = NGINX_LINK.resolve(strict=True)
    text = target.read_text(encoding="utf-8")
    if "obsidian-livedebug-managed" in text:
        return
    https_marker = """    location / {
        proxy_pass http://127.0.0.1:5984;"""
    marker_index = text.find(https_marker)
    if marker_index < 0:
        raise RuntimeError("Could not find the CouchDB root location in nginx config")
    backup = target.with_name(target.name + ".before-livedebug-" + str(int(time.time())))
    shutil.copy2(target, backup)
    target.write_text(text[:marker_index] + LOCATION + text[marker_index:], encoding="utf-8")
    try:
        run("nginx", "-t")
    except Exception:
        shutil.copy2(backup, target)
        raise


def main():
    if os.geteuid() != 0:
        raise SystemExit("Run as root")
    ensure_user()
    install_files()
    ensure_secrets()
    install_nginx_location()
    run("systemctl", "daemon-reload")
    run("systemctl", "enable", "--now", "obsidian-live-debug.service")
    run("systemctl", "restart", "obsidian-live-debug.service")
    run("systemctl", "reload", "nginx")
    print("Obsidian LiveDebug relay installed")


if __name__ == "__main__":
    main()
