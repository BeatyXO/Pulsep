# Stable Studionet deployment record

Target is fixed:

- Network: **Studionet**
- Chain ID: **61999**
- RPC: `https://studio.genlayer.com/api`
- Repository-local CLI: **genlayer 0.39.1**
- Contract: `contracts/pulsep.py`

## Current handoff state

Pulsep is **not yet deployed in this handoff**. `public/deployment.json` intentionally has `verified: false`. Do not replace that flag until all identity checks below have actual values.

## Required final evidence

Codex must replace this section with concrete proof:

- canonical Git commit: TODO
- contract source SHA-256 (LF): TODO
- Pulsep contract address: TODO
- deployment transaction: TODO
- deployment receipt status: TODO
- deployed source read-back matches tracked source: TODO
- deployed ABI/schema contains every expected method: TODO
- `get_config().version == pulsep.v0.1`: TODO
- `get_config().network_scope == studionet-only`: TODO
- `get_config().admin == null`: TODO

## Required live lifecycles

At minimum record real finalized transactions for:

1. **NO_BREACH period** — full provider credit and withdrawal.
2. **MAJOR breach period** — frozen customer/provider split and both credits reconciled.
3. **Maintenance/exclusion case** — demonstrate evidence reasoning rather than raw downtime threshold only.
4. **INCONCLUSIVE case** — required evidence unavailable/conflicting; bond remains locked.
5. **INCONCLUSIVE reassessment** — later evidence availability reaches a conclusive result OR an evidence-window expiry returns the bond under the frozen recovery rule.
6. **Recurring second period** — provider funds a second period on the same pact after period 1 becomes terminal.

## Required negative finalized executions

Record representative expected rejections such as:

- wrong wallet accepting a proposal;
- wrong bond amount;
- assessment before period end;
- second settlement attempt;
- funding next period while current period is not terminal;
- closing while a funded period is active;
- empty-credit withdrawal.

## Accounting proof

For each live settlement capture before/after:

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

Only after deployment/source verification:

1. fill `public/deployment.json` with address, chain 61999, version, source SHA-256 and deployment tx;
2. set `verified: true`;
3. run frontend typecheck/tests/build;
4. prove the frontend blocks a mismatched source/policy deployment;
5. deploy the static frontend;
6. test read-only pact state anonymously;
7. test injected-wallet approval and rejection with the owner handling private wallet prompts.

Finally run:

```bash
python scripts/preflight.py --final
```
