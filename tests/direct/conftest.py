"""Direct Mode compatibility and deterministic clock helpers."""
import inspect
import os
import sys
from datetime import datetime, timezone
import pytest

NOW = 2_000_000_000

if sys.platform == "win32":
    _unlink = os.unlink
    def _compat_unlink(path, *args, **kwargs):
        try:
            return _unlink(path, *args, **kwargs)
        except PermissionError:
            callers = [frame.filename.replace("\\", "/") for frame in inspect.stack()]
            if any(name.endswith("/gltest/direct/loader.py") for name in callers):
                return None
            raise
    os.unlink = _compat_unlink


def iso(value: int) -> str:
    return datetime.fromtimestamp(value, tz=timezone.utc).isoformat()


def addr(account) -> str:
    return "0x" + account.hex()


@pytest.fixture(autouse=True)
def clock(direct_vm):
    original = direct_vm.warp
    def warp(value):
        original(value)
        for module in tuple(sys.modules.values()):
            raw = getattr(getattr(module, "gl", None), "message_raw", None)
            if isinstance(raw, dict) and "datetime" in raw:
                raw["datetime"] = value
    direct_vm.warp = warp
    warp(iso(NOW))
