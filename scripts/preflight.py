from __future__ import annotations

import ast
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FINAL = "--final" in sys.argv
errors: list[str] = []
GENERATED_DIRS = {"node_modules", ".pnpm-store", ".next", "out", ".venv", "__pycache__", ".pytest_cache", ".local", "artifacts"}


def source_files():
    """Yield tracked-source candidates without descending into generated trees."""
    for current, dirs, files in os.walk(ROOT):
        dirs[:] = [name for name in dirs if name not in GENERATED_DIRS]
        for name in files:
            yield Path(current) / name

required = [
    "contracts/pulsep.py",
    "app/page.tsx",
    "app/pacts/new/page.tsx",
    "app/pacts/view/page.tsx",
    "app/activity/page.tsx",
    "components/HomeClient.tsx",
    "components/NewPactClient.tsx",
    "components/ViewPactClient.tsx",
    "lib/chain.ts",
    "public/deployment.json",
    "README.md",
    "BUILD_STATUS.md",
    "AGENT_HANDOFF.md",
    "DEPLOYMENT.md",
    "SUBMISSION.md",
    "docs/ARCHITECTURE.md",
    "docs/INVARIANTS.md",
    "docs/SECURITY.md",
    "docs/VERIFICATION_PLAN.md",
    "tests/direct/test_pulsep.py",
    "tests/test_source_invariants.py",
]
for rel in required:
    if not (ROOT / rel).exists(): errors.append(f"missing required file: {rel}")

contract = ROOT / "contracts/pulsep.py"
if contract.exists():
    src = contract.read_text(encoding="utf-8")
    try: ast.parse(src)
    except SyntaxError as exc: errors.append(f"contract syntax error: {exc}")
    for marker in [
        "pulsep.v0.1", "run_nondet_unsafe", "gl.nondet.web.get", "PULSEP_SLA_PERIOD_V1",
        "NO_BREACH", "MINOR", "MAJOR", "SEVERE", "INCONCLUSIVE",
        "PROVIDER", "INDEPENDENT", "assessment_key", "customer_bps",
        "EXPIRED_UNRESOLVED", "fund_next_period", "expire_unresolved",
        "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6",
    ]:
        if marker not in src: errors.append(f"missing contract marker: {marker}")

package = ROOT / "package.json"
if package.exists():
    data = json.loads(package.read_text(encoding="utf-8"))
    if data.get("devDependencies", {}).get("genlayer") != "0.39.1": errors.append("repository-local GenLayer CLI must be pinned to 0.39.1")
    if data.get("dependencies", {}).get("genlayer-js") != "1.1.8": errors.append("genlayer-js stable dependency must be pinned to 1.1.8")

text = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in source_files() if p.suffix.lower() in {".md",".py",".ts",".tsx",".json",".yml",".yaml"} and p.resolve() not in {(ROOT / "scripts/preflight.py").resolve(), (ROOT / "tests/test_source_invariants.py").resolve()})
if "https://studio.genlayer.com/api" not in text: errors.append("stable Studionet RPC reference missing")
if "61999" not in text: errors.append("stable Studionet chain ID reference missing")
if "studio-dev.genlayer.com/api" in text or re.search(r"\b61997\b", text): errors.append("preview-network reference found")
for banned in ["supabase", "firebase", "cloudflare worker", "express server", "railway.app"]:
    if banned in text.lower() and "do not" not in text.lower(): errors.append(f"possible application backend dependency found: {banned}")

for current, dirs, files in os.walk(ROOT):
    current_path = Path(current)
    for name in tuple(dirs):
        if name in GENERATED_DIRS:
            errors.append(f"generated/private artifact present: {(current_path / name).relative_to(ROOT)}")
            dirs.remove(name)
    for name in files:
        if name in {".env", "id_rsa", "id_ed25519"}:
            errors.append(f"sensitive file present: {(current_path / name).relative_to(ROOT)}")

if FINAL:
    dep = json.loads((ROOT / "public/deployment.json").read_text(encoding="utf-8"))
    if dep.get("verified") is not True: errors.append("final mode requires deployment.json verified=true")
    if not re.fullmatch(r"0x[0-9a-fA-F]{40}", str(dep.get("address", ""))): errors.append("final mode requires a contract address")
    if not re.fullmatch(r"0x[0-9a-fA-F]{64}", str(dep.get("deploymentTransaction", ""))): errors.append("final mode requires a deployment tx")
    if not re.fullmatch(r"[0-9a-fA-F]{64}", str(dep.get("sourceSha256", ""))): errors.append("final mode requires source SHA-256")
    proof = (ROOT / "DEPLOYMENT.md").read_text(encoding="utf-8").lower()
    for marker in ["todo", "not yet", "placeholder", "awaiting live", "not deployed"]:
        if marker in proof: errors.append(f"final deployment document still contains unresolved marker: {marker}")

if errors:
    print("PREFLIGHT FAIL")
    for item in errors: print(" -", item)
    raise SystemExit(1)

print("PREFLIGHT PASS")
print(" - repository structure present")
print(" - contract Python parses")
print(" - stable GenLayer dependency and CLI policy present")
print(" - evidence/consensus/uncertainty markers present")
print(" - frontend is direct-wallet / contract-oriented")
print(" - stable Studionet 61999 references present")
if not FINAL: print(" - handoff mode: live deployment proof may still be incomplete")
