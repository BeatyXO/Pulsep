# Stable Studionet deployment record

Target is fixed:

- Network: **Studionet**
- Chain ID: **61999**
- RPC: `https://studio.genlayer.com/api`
- Repository-local CLI: **genlayer 0.39.1**
- Contract: `contracts/pulsep.py`

## Canonical deployment (verified)

- Contract: [`0x450d7D146B7F5041C7a4a0d0d70b65db1D58A43f`](https://explorer-studio.genlayer.com/address/0x450d7D146B7F5041C7a4a0d0d70b65db1D58A43f)
- Deployment transaction: [`0x11b096c4245e6f8d816f62cd9396972d7c2c12b9e229a3a91f3b22d0717f0362`](https://explorer-studio.genlayer.com/tx/0x11b096c4245e6f8d816f62cd9396972d7c2c12b9e229a3a91f3b22d0717f0362)
- Receipt: `FINALIZED`; execution `SUCCESS`; consensus `MAJORITY_AGREE` (four `AGREE`, one `IDLE`).
- Normalized-LF source SHA-256: `5a4784f9274bf12b68b3ff1d1b2b3906d473e72856a9641bda3a8a4d22f92bce`.
- Deployed source read-back hash matches the local contract source exactly.
- Schema read-back: 14 methods (6 views, 8 writes).
- `get_config()`: `version=pulsep.v0.1`, `network_scope=studionet-only`, `admin=null`.
- `public/deployment.json` is bound to this verified deployment.
- The workspace has no Git metadata; a canonical commit SHA is not available here.

Machine-readable deployment and verification details are in `public/deployment.json` and `public/verification.json`.

## Local verification

- Repository-local GenLayer CLI: `0.39.1`.
- Direct Mode + source invariants: 26/26 passed.
- GenVM lint and semantic validation passed with stable runner `v0.2.16`.
- Frontend typecheck, 8 frontend tests, and production static build passed.

## Remaining live lifecycle evidence

Deployment is verified, but these pact-level stories still need real finalized Studionet evidence:

1. **NO_BREACH period** — full provider credit and withdrawal.
2. **MAJOR breach period** — frozen customer/provider split and both credits reconciled.
3. **Maintenance/exclusion case** — demonstrate evidence reasoning rather than raw downtime threshold only.
4. **INCONCLUSIVE case** — required evidence unavailable/conflicting; bond remains locked.
5. **INCONCLUSIVE reassessment** — later evidence availability reaches a conclusive result OR an evidence-window expiry returns the bond under the frozen recovery rule.
6. **Recurring second period** — provider funds a second period on the same pact after period 1 becomes terminal.

## Remaining negative finalized executions

Representative expected rejections have not yet been recorded. Cover:

- wrong wallet accepting a proposal;
- wrong bond amount;
- assessment before period end;
- second settlement attempt;
- funding next period while current period is not terminal;
- closing while a funded period is active;
- empty-credit withdrawal.

## Remaining accounting proof

No pact settlement has been performed yet. For each live settlement capture before/after:

- contract balance;
- customer balance;
- provider balance;
- `deposited`;
- `locked`;
- `credited`;
- `withdrawn`;
- customer claimable;
- provider claimable;
- triggered outbound transfer receipts after withdrawal.

## Frontend binding

1. `public/deployment.json` now contains the source-verified contract address, chain, version, hash and deployment transaction.
2. Typecheck, frontend tests and static production build passed.
3. Live contract configuration/source verification is recorded above; the browser wallet flow and anonymous hosted-site checks remain to be performed after Vercel deployment.

Finally run:

```bash
python scripts/preflight.py --final
```
