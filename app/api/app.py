import os
import random
import time
from typing import Any

from flask import Flask, jsonify, request
from prometheus_flask_exporter import PrometheusMetrics


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False
    PrometheusMetrics(app)

    version = os.getenv("VERSION", "v1")
    error_rate = _read_float("ERROR_RATE", 0.0)
    response_delay_ms = _read_int("RESPONSE_DELAY_MS", 0)
    app_name = os.getenv("APP_NAME", "demo-api")

    @app.get("/healthz")
    def healthz() -> tuple[str, int]:
        return "ok", 200

    @app.get("/api/info")
    def info() -> tuple[Any, int]:
        _maybe_sleep(response_delay_ms)
        if _should_fail(error_rate):
            return jsonify(
                {
                    "ok": False,
                    "app": app_name,
                    "version": version,
                    "error": "injected failure",
                }
            ), 500

        return jsonify(
            {
                "ok": True,
                "app": app_name,
                "version": version,
                "requestId": request.headers.get("X-Request-Id", ""),
                "responseDelayMs": response_delay_ms,
            }
        ), 200

    @app.get("/api/config")
    def config() -> Any:
        return jsonify(
            {
                "app": app_name,
                "version": version,
                "errorRate": error_rate,
                "responseDelayMs": response_delay_ms,
            }
        )

    return app


def _read_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default

    try:
        value = float(raw)
    except ValueError:
        return default

    return min(max(value, 0.0), 1.0)


def _read_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default

    try:
        value = int(raw)
    except ValueError:
        return default

    return max(value, 0)


def _maybe_sleep(response_delay_ms: int) -> None:
    if response_delay_ms > 0:
        time.sleep(response_delay_ms / 1000)


def _should_fail(error_rate: float) -> bool:
    return random.random() < error_rate


app = create_app()


if __name__ == "__main__":
    port = _read_int("PORT", 5001)
    app.run(host="0.0.0.0", port=port)
