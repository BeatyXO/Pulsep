from pathlib import Path
import ast
import os

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "contracts/pulsep.py"
GENERATED_DIRS = {"node_modules", ".pnpm-store", ".next", "out", ".venv", "__pycache__", ".pytest_cache", ".local", "artifacts"}


def source_files():
    for current, dirs, files in os.walk(ROOT):
        dirs[:] = [name for name in dirs if name not in GENERATED_DIRS]
        for name in files:
            yield Path(current) / name


def source(): return CONTRACT.read_text(encoding="utf-8")

def test_contract_parses(): ast.parse(source())

def test_stable_runner_pin_is_present(): assert "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" in source()

def test_consensus_and_web_access_are_substantive():
    text = source()
    for marker in ["run_nondet_unsafe", "gl.nondet.web.get", "PULSEP_SLA_PERIOD_V1", "INCONCLUSIVE", "assessment_key"]:
        assert marker in text

def test_model_does_not_receive_settlement_authority():
    text = source()
    prompt = text[text.index('PULSEP_SLA_PERIOD_V1'):text.index('INPUT:', text.index('PULSEP_SLA_PERIOD_V1'))]
    assert "Do not decide recipients" in prompt
    assert "customer_bps" not in prompt

def test_network_is_not_preview_network():
    text = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in source_files() if p.suffix in {".py",".md",".ts",".tsx",".json",".yaml",".yml"} and p.resolve() != Path(__file__).resolve() and p.resolve() != (ROOT / "scripts/preflight.py").resolve())
    assert "studio-dev.genlayer.com/api" not in text
    assert "61997" not in text
