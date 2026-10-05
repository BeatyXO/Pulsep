# Pulsep build status

## v0.3 contract and live lifecycle

- Canonical live contract: `0xfaA7FADDEcb4EDe3Bd46001bDf812076b953067A` on stable Studionet (61999).
- Deployment: `0x768d607db626ceffc04290e446a756044c215b090d8fb316e0a948a96a77f7a2`, FINALIZED, SUCCESS, MAJORITY_AGREE.
- Normalized LF source SHA-256: `e197ed38930276bcdc49a0235717decd3dffd2a85227d104889400898d19dddc`; read-back matched.
- `get_config()` reports `pulsep.v0.3`, `studionet-only`, and `admin=null`.
- A NO_BREACH lifecycle completed on pact `PULSE-V03-LIVE-NB-20261005-01`: proposal, exact 0.001 GEN funding, 900-second period, 300-second maturity, finalized assessment, provider 100% credit, finalized withdrawal. Transactions and accounting are in `public/verification.json`.
- The previous v0.2 deployment returned MAJORITY_DISAGREE on four assessments for an equivalent no-breach case and remained locked. v0.3 consensus comparison omits free-form narrative reason fields while preserving classification, exact findings/quotes, coverage, exclusion evidence, timeline source/time, provenance and period boundaries.

## Local checks

- Repository-local GenLayer CLI: 0.39.1.
- Python compile: PASS.
- GenVM lint on stable runner v0.2.16: PASS.
- Direct Mode: 28 tests PASS.
- TypeScript typecheck: PASS.
- v0.3 Vitest and build: not reconfirmed in this session.
- GitHub Actions for v0.3 commit: unavailable because stored GitHub credentials are invalid; the last green workflow predates v0.3.

## Remaining verification

- Push v0.3 and evidence/docs updates to GitHub, then confirm Actions is green.
- Verify the Vercel production frontend serves the v0.3 `public/deployment.json` binding and check routes/responsive states.
- Wallet browser flow was not tested.
- No live MAJOR, exclusion, INCONCLUSIVE/recovery, negative-transition, or recurring-period-2 evidence is claimed.
- Recipient balance delta was not captured; the finalized outbound transfer receipt records recipient and amount.

Studionet GEN is simulated. Pulsep is not represented as audited, bug-free, production-safe, real-money settlement, or legally binding arbitration.
