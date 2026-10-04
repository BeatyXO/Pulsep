# Stable Studionet deployment record

## Network policy

- Network: stable **Studionet** only
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Repository-local CLI: `genlayer@0.39.1`
- Contract: `contracts/pulsep.py`

## Canonical v0.2 deployment (verified)

- Contract: [`0x99b88F9724182Fa6e4C5A7a8e936AcAeA5872A82`](https://explorer-studio.genlayer.com/address/0x99b88F9724182Fa6e4C5A7a8e936AcAeA5872A82)
- Deployment transaction: [`0x43eb394bbbdd5842450e73e85d5cb10dc4d056ce004a8c3905ed4739a0c3fe35`](https://explorer-studio.genlayer.com/tx/0x43eb394bbbdd5842450e73e85d5cb10dc4d056ce004a8c3905ed4739a0c3fe35)
- Receipt: `FINALIZED`; execution `SUCCESS`; consensus `MAJORITY_AGREE` (three `AGREE`, two `IDLE`).
- Normalized-LF source SHA-256: `0a3c89de6f92ddb34832aaee53119a75d8293d98a04a3d006b4203a6e89902b1`.
- Deployed source read-back hash matches local tracked source exactly.
- Schema: 14 methods (6 views, 8 writes).
- `get_config()`: `version=pulsep.v0.2`, `network_scope=studionet-only`, `admin=null`, `assessment_cooldown_seconds=300`, `evidence_maturity_seconds=300`, `evidence_grace_seconds=604800`.
- Contract source commit: [`ebcec3542349af107c2d8b821750369413d6c520`](https://github.com/BeatyXO/Pulsep/commit/ebcec3542349af107c2d8b821750369413d6c520).

Machine-readable values and remaining lifecycle proof are in `public/deployment.json` and `public/verification.json`.

## Local and GitHub verification

- Repository-local GenLayer CLI: `0.39.1`.
- Stable GenVM semantic lint and Direct Mode runner: `v0.2.16`.
- Direct Mode: 28 tests passed.
- Frontend: typecheck passed, 8 tests passed, production build passed.
- GitHub Actions run: [37243624520](https://github.com/BeatyXO/Pulsep/actions/runs/37243624520), green for commit `ebcec3542349af107c2d8b821750369413d6c520`.

## Synthetic public evidence fixtures

Labeled demonstration fixtures are in `public/evidence/`. Stable fixtures use commit-pinned raw URLs. The recovery case reserves one mutable `main` raw URL so the initially unavailable page can become available before reassessment; the fixture must be added only after the first INCONCLUSIVE transaction, preserving actual 404-then-recovery behavior.

## Live lifecycle evidence still required

The contract has not yet settled live pact periods. Record finalized Studionet transactions for NO_BREACH, MAJOR, provider-source failure with independent breach evidence, late and timely maintenance reasoning, INCONCLUSIVE with locked funds, later reassessment or expiry recovery, and recurring period 2. Also record expected failed executions, exact source digests, consensus details, accounting snapshots, recipient balance deltas and finalized outbound withdrawal evidence. Do not infer or fabricate these results.

## Frontend binding

The canonical frontend is [https://pulsep.vercel.app/](https://pulsep.vercel.app/). Its contract binding lives in `public/deployment.json`; no Vercel contract-address environment variable is read by the app. Pushing the verified JSON to the connected Vercel project should trigger a deploy. Verify production serves this exact v0.2 binding before treating frontend deployment as complete.

Studionet GEN is simulated. No independent audit, real-money settlement or legal-arbitration claim is made.
