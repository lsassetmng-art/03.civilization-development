import json
import mimetypes
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

APP_NAME = "CivilizationOS"
APP_VERSION = "0.1.0"
DEFAULT_PORT = 18080

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
DATA_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "data"))

SYSTEM_INFO = {
    "name": APP_NAME,
    "version": APP_VERSION,
    "runtime": "python-stdlib-http",
    "environment": "termux-local",
    "data_dir": DATA_DIR,
}

MODULES = [
    {
        "id": "constitution",
        "name": "Constitution",
        "status": "planned",
        "description": "CivilizationOS core rules and invariants."
    },
    {
        "id": "architecture",
        "name": "Architecture",
        "status": "planned",
        "description": "System structure and domain boundaries."
    },
    {
        "id": "runtime",
        "name": "Runtime",
        "status": "prototype",
        "description": "Execution shell and local service runtime."
    },
    {
        "id": "integration",
        "name": "Integration",
        "status": "planned",
        "description": "External and internal connector interfaces."
    },
]

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class CivilizationHandler(BaseHTTPRequestHandler):
    server_version = "CivilizationOS/0.1"

    def log_message(self, fmt, *args):
        print("[%s] %s - %s" % (utc_now_iso(), self.address_string(), fmt % args))

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, file_path: str):
        if not os.path.isfile(file_path):
            self.send_error(404, "Not Found")
            return

        content_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
        with open(file_path, "rb") as f:
            body = f.read()

        self.send_response(200)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8" if content_type.startswith("text/") or content_type in ("application/javascript", "application/json") else content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_index(self):
        self._send_file(os.path.join(STATIC_DIR, "index.html"))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self._send_json(200, {
                "ok": True,
                "name": APP_NAME,
                "version": APP_VERSION,
                "timestamp_utc": utc_now_iso(),
            })
            return

        if path == "/api/system":
            self._send_json(200, {
                "system": SYSTEM_INFO,
                "timestamp_utc": utc_now_iso(),
            })
            return

        if path == "/api/modules":
            self._send_json(200, {
                "count": len(MODULES),
                "modules": MODULES,
                "timestamp_utc": utc_now_iso(),
            })
            return

        if path in ("/", "/index.html"):
            self._serve_index()
            return

        rel = os.path.normpath(path.lstrip("/"))
        target = os.path.normpath(os.path.join(STATIC_DIR, rel))

        if not target.startswith(STATIC_DIR):
            self.send_error(403, "Forbidden")
            return

        if os.path.isfile(target):
            self._send_file(target)
            return

        self._serve_index()

def main():
    port = int(os.environ.get("CIVILIZATION_OS_PORT", str(DEFAULT_PORT)))
    host = os.environ.get("CIVILIZATION_OS_HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, port), CivilizationHandler)
    print(f"[CivilizationOS] serving on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("[CivilizationOS] stopped")

if __name__ == "__main__":
    main()
