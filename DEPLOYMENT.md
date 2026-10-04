# Stable Studionet deployment record

## Network policy

- Network: stable **Studionet** only
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Repository-local CLI: `genlayer@0.39.1`
- Semantic validation / Direct Mode GenVM: stable `v0.2.16`

## Prior deployment (superseded)

- Contract `0x450d7D146B7F5041C7a4a0d0d70b65db1D58A43f` was deployed as `pulsep.v0.1`.
- Its finalized deployment transaction was `0x11b096c4245e6f8d816f62cd9396972d7c2c12b9e229a3a91f3b22d0717f0362`.
- Source SHA-256 (normalized LF) was `5a4784f9274bf12b68b3ff1d1b2b3906d473e72856a9641bda3a8a4d22f92bce`.
- That contract is superseded by the v0.2 fixes and must not be used by the updated frontend.

## Current v0.2 deployment state

No v0.2 deployment has been made yet. `public/deployment.json` is deliberately unverified and has no address/transaction until the final v0.2 source is committed, deployed once, finalized and read back byte-for-byte. The canonical frontend must remain write-locked against the superseded v0.1 policy until its deployment JSON and frontend build are updated.

## Verification required after deployment

Record the actual v0.2 source commit and normalized-LF SHA-256, address, deployment transaction/receipt, source read-back, method list and `get_config()` values (`pulsep.v0.2`, `studionet-only`, `admin=null`, evidence maturity 300s, reassessment cooldown 300s). Never enter estimated values.

The production frontend target is [https://pulsep.vercel.app/](https://pulsep.vercel.app/). Its existing Vercel integration should build from pushed repository changes; the contract binding is `public/deployment.json`, not a runtime secret or private environment variable.

## Live lifecycle evidence

No v0.2 pact-level lifecycle or withdrawal evidence has been recorded yet. Required proof remains NO_BREACH, MAJOR, provider-source outage with independent breach, late and timely maintenance exclusion reasoning, INCONCLUSIVE, later recovery/reassessment or expiry, and a terminal pact's funded second period. Record finalized transaction outcomes, source URLs/digests, validator receipts where available and per-party accounting snapshots in `public/verification.json`.

Expected failed executions must be labeled as expected failures and include the actual finalized result. Accounting must reconcile deposits, locked/credited/withdrawn values, customer/provider claims, recipient balance deltas and outbound transfer receipts.

## Local verification commands

```bash
pnpm install --frozen-lockfile
pnpm genlayer -- --version
pnpm typecheck
pnpm test
pnpm build
python -m pip install -r requirements-test.txt
python scripts/preflight.py
python -m compileall contracts scripts tests
genvm-lint check contracts/pulsep.py
gltest -q
```

For semantic validation and Direct Mode, pin `GENVM_VERSION=v0.2.16`. Do not use another network or an RC/newer GenLayer CLI.

`python scripts/preflight.py --final` remains pending until deployment and live evidence are genuinely complete.

Studionet GEN is simulated. No audit, bug-free guarantee, production-safety claim, real-money settlement claim or legal-arbitration claim is made.
