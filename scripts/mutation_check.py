"""Prove key Direct Mode invariants kill weakened contract-source mutants."""
from __future__ import annotations

import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "contracts/pulsep.py").read_text(encoding="utf-8")

MUTANTS = [
    (
        "counterparty authorization",
        "test_revision_counterparty_digest_binding_and_future_period_activation",
        'require(actor() == (pact["provider"] if pending["proposer"] == pact["customer"] else pact["customer"]), "Only the designated counterparty may approve")',
        'require(True, "Only the designated counterparty may approve")',
    ),
    (
        "period version binding",
        "test_inconclusive_reassessment_keeps_the_period_bound_to_its_original_revision",
        '"sla_version": int(version_record["version"]),',
        '"sla_version": int(version_record["version"]) + 1,',
    ),
    (
        "atomic revision activation",
        "test_revision_counterparty_digest_binding_and_future_period_activation",
        'if pending is not None and pending["status"] == "APPROVED":\n            self._record_revision_event(pact, "ACTIVATED", pending, current)',
        'if False:\n            self._record_revision_event(pact, "ACTIVATED", pending, current)',
    ),
    (
        "deterministic settlement conservation",
        "test_major_breach_deterministically_splits_bond",
        'provider_amount = bond - customer_amount',
        'provider_amount = bond',
    ),
    (
        "coverage quote equivalence",
        "test_validator_comparison_accepts_grounded_coverage_and_no_exclusion_variants",
        '"coverage": item["coverage"],',
        '"coverage": item["coverage"],\n            "coverage_quote": item["coverage_quote"],',
    ),
    (
        "no-breach coverage timeline normalization",
        "test_validator_comparison_accepts_grounded_coverage_and_no_exclusion_variants",
        'if classification == "NO_BREACH":\n        # Full-period coverage is already represented in the source findings.',
        'if False:\n        # Full-period coverage is already represented in the source findings.',
    ),
    (
        "no-applied-exclusion alias equivalence",
        "test_validator_comparison_accepts_grounded_coverage_and_no_exclusion_variants",
        'if exclusion_status in ("NOT_RELEVANT", "DOES_NOT_APPLY"):',
        'if exclusion_status == "NOT_RELEVANT":',
    ),
    (
        "classification remains consensus-bound",
        "test_validator_re_evaluation_rejects_a_different_classification",
        '"classification": result["classification"],',
        '"classification": "NO_BREACH",',
    ),
    (
        "exact quote grounding remains enforced",
        "test_malformed_assessment_fails_closed",
        'if quote and quote not in source["text"]:',
        'if False and quote not in source["text"]:',
    ),
    (
        "breach event source and timing remain consensus-bound",
        "test_validator_comparison_binds_breach_event_source_and_time",
        '({"at": item["at"], "source_id": item["source_id"]} for item in result["timeline"])',
        '({"at": "", "source_id": ""} for item in result["timeline"])',
    ),
]


def run_test(node_id: str, contract_path: Path | None = None) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    if contract_path is not None:
        env["PULSEP_CONTRACT_PATH"] = str(contract_path)
    return subprocess.run(
        [sys.executable, "-m", "pytest", "-q", f"tests/direct/test_pulsep.py::{node_id}"],
        cwd=ROOT,
        env=env,
        text=True,
        capture_output=True,
        timeout=240,
        check=False,
    )


def main() -> int:
    targets = sorted({target for _, target, _, _ in MUTANTS})
    for target in targets:
        baseline = run_test(target)
        if baseline.returncode != 0:
            print(f"BASELINE FAIL: {target}\n{baseline.stdout}\n{baseline.stderr}")
            return 1

    killed = 0
    with tempfile.TemporaryDirectory(prefix="pulsep-mutants-") as temp_dir:
        temp = Path(temp_dir)
        for index, (name, target, old, new) in enumerate(MUTANTS, start=1):
            if old not in SOURCE:
                print(f"MUTATION SETUP FAIL: source anchor missing for {name}")
                return 1
            mutated = SOURCE.replace(old, new, 1)
            mutant_path = temp / f"pulsep_mutant_{index}.py"
            mutant_path.write_text(mutated, encoding="utf-8", newline="\n")
            result = run_test(target, mutant_path)
            if result.returncode == 0:
                print(f"MUTANT SURVIVED: {name}")
                return 1
            combined = result.stdout + result.stderr
            if "failed" not in combined.lower() and "error" not in combined.lower():
                print(f"MUTATION INFRASTRUCTURE ERROR: {name}\n{combined}")
                return 1
            killed += 1
            print(f"KILLED: {name}")

    print(f"MUTATION CHECK PASS: {killed}/{len(MUTANTS)} contract mutants killed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
