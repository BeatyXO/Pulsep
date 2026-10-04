# Pulsep build status

## Current handoff update

The v0.2 hardening is in progress on top of `main`:

- Independent evidence is the agreed evidence anchor. Provider-source unavailability alone does not veto an independently supported breach.
- `NO_BREACH` requires an independently supporting NO_BREACH finding plus exact quoted full-period coverage.
- Evidence coverage/freshness (`COVERS_PERIOD`, `STALE`, `PARTIAL`, `UNKNOWN`, `UNAVAILABLE`) is normalized and validator-bound.
- Provider/maintenance exclusions marked as applying require an exact quote from an available provider or maintenance source.
- Evidence maturity opens assessment 300 seconds after service-period end.
- `INCONCLUSIVE` retries are permitted until the fixed evidence deadline with a deterministic 300-second cooldown, not a fixed attempt limit.
- Validator comparison binds the full normalized assessment, including reasons, quotes, coverage, exclusions, timeline, provenance and period boundaries.
- `INDEPENDENT` means a source role declared in customer-proposed terms and accepted by the provider; ownership/independence is not externally authenticated.
- Contract/frontend guard version is `pulsep.v0.2`; the prior v0.1 production binding is disabled pending deployment and verification of the fixed source.
- CI pins both CLI package version (`genlayer@0.39.1`) and GenVM runner (`v0.2.16`) and uses frozen pnpm installation.

## Verification observed for current changes

- `pnpm install --frozen-lockfile`: PASS; lockfile current, repository-local CLI 0.39.1.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, 8 tests.
- `pnpm build`: PASS; static routes generated.
- `python -m pip install -r requirements-test.txt`: PASS (requirements already installed).
- Direct Mode: PASS, 28 tests after the v0.2 behavior changes.
- `genvm-lint check contracts/pulsep.py` with `GENVM_VERSION=v0.2.16`: PASS, static checks and SDK semantic validation; 14 methods (6 views, 8 writes).
- GitHub Actions on the pre-fix `main` commit `e3d0f19dedeee5e842fe22c116631525c78a3933`: PASS. Updated commit Actions run is pending.
- Stable Studionet CLI network configuration and unlocked signer are available; the signer address matches the previously verified v0.1 deployment sender. No v0.2 deployment has been performed yet.

## Still required

- Commit and push these source changes; wait for green Actions.
- Deploy the exact final v0.2 source once to stable Studionet 61999 and verify finalized receipt, source read-back, schema and `get_config()`.
- Bind frontend `public/deployment.json` only after that verification. Vercel's prior site at `https://pulsep.vercel.app/` still serves the older v0.1 release until the updated source/config is deployed.
- Run the real Studionet pacts, assessments, reassessment/recovery, withdrawals, recurring period and expected-failure transactions; record observed evidence only.
- Verify responsive routes and wallet transaction recovery where browser-wallet access is available.
- Update the evidence pack and run final preflight only after all required evidence exists.

Studionet GEN is simulated. This project has not been independently audited and is not a real-money or legally binding arbitration service.
