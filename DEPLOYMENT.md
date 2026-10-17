# Stable Studionet deployment record

## Historical v0.3 deployment

This is the preserved original deployment and completed lifecycle proof. The v0.4 milestone deployment below is now the current contract target.

- Network: stable Studionet, chain ID `61999`; RPC `https://studio.genlayer.com/api`.
- Repository-local CLI: `genlayer@0.39.1`.
- Contract: [`0xfaA7FADDEcb4EDe3Bd46001bDf812076b953067A`](https://explorer-studio.genlayer.com/address/0xfaA7FADDEcb4EDe3Bd46001bDf812076b953067A).
- Deployment transaction: [`0x768d607db626ceffc04290e446a756044c215b090d8fb316e0a948a96a77f7a2`](https://explorer-studio.genlayer.com/tx/0x768d607db626ceffc04290e446a756044c215b090d8fb316e0a948a96a77f7a2), FINALIZED, SUCCESS.
- Normalized-LF source SHA-256: `e197ed38930276bcdc49a0235717decd3dffd2a85227d104889400898d19dddc`; deployed read-back matched.
- `get_config()`: `version=pulsep.v0.3`, `network_scope=studionet-only`, `admin=null`.

The v0.2 deployment at `0x99b88F9724182Fa6e4C5A7a8e936AcAeA5872A82` was superseded after four finalized `MAJORITY_DISAGREE` no-breach assessments left its test bond locked. The minimal v0.3 fix compares consequential decision material but does not require narrative prose to match. v0.2 remains historical and is not the frontend target.

## Live lifecycle evidence

One full v0.3 NO_BREACH lifecycle is complete. Pact `PULSE-V03-LIVE-NB-20261005-01` was proposed, accepted and funded at exactly 0.001 GEN; after its 900-second service period and 300-second maturity window, assessment finalized as NO_BREACH. Contract credited the entire bond to the provider and a finalized withdrawal receipt records an outbound transfer of the exact amount to that provider. Transaction hashes, evidence source URLs/digests, and accounting snapshots are in `public/verification.json`.

This is not proof for MAJOR, maintenance exclusions, INCONCLUSIVE recovery, recurrence, or negative transitions. The prior v0.2 locked bond has no withdrawal evidence. Studionet GEN is simulated.

## Frontend binding and status

The app reads `public/deployment.json`; no Vercel address environment variable is used. At the time this historical v0.3 proof was recorded, that manifest pointed to v0.3. The canonical frontend is [https://pulsep.vercel.app/](https://pulsep.vercel.app/); its production v0.4 binding still needs post-release verification.

## Versioned SLA Renewals milestone (v0.4)

- Network: stable Studionet, chain ID `61999`; RPC `https://studio.genlayer.com/api`.
- Repository-local CLI: `genlayer@0.39.1`.
- Contract: [`0x5B5dDeeaDBfCc2075A7E75401202E259a076f9Cf`](https://explorer-studio.genlayer.com/address/0x5B5dDeeaDBfCc2075A7E75401202E259a076f9Cf).
- Deployment transaction: [`0xe6ac4004f06780953c9edcdaca61e7b90bc407c9bd0d5614bfe6a8abe23f4ef8`](https://explorer-studio.genlayer.com/tx/0xe6ac4004f06780953c9edcdaca61e7b90bc407c9bd0d5614bfe6a8abe23f4ef8), FINALIZED, SUCCESS, MAJORITY_AGREE (5 validators).
- Normalized-LF source SHA-256: `a03b0b5b509af6648dfa95125594e5fd2ce01532de839dbb2bcf1f9e9c3df3c3`; read-back matched local source exactly.
- `get_config()`: `version=pulsep.v0.4`, `network_scope=studionet-only`, `admin=null`, `max_sla_versions=8`, `revision_expiry_seconds=86400`.
- Deployed schema: 21 methods (9 views, 12 writes), including all four revision writes.
- The versioned-renewal live proof remains incomplete. On `PULSE-WALLET-LIVE-20261017-01`, period 1 settled `NO_BREACH`; the provider withdrew exactly `0.001 GEN`, and a finalized outbound transfer receipt and balance delta are recorded. The same pact accepted version 2 and funded period 2. Four period-2 assessments ended in `MAJORITY_DISAGREE`, leaving its 0.001 GEN bond locked. The separate pact `PULSE-V04-RENEWAL-20261017-01` period 1 remains funded after another `UNDETERMINED / MAJORITY_DISAGREE` assessment. At the latest recorded Studionet timestamp, both evidence deadlines were still in the future, so `expire_unresolved` was not eligible. Full receipts, source digests and accounting are in `public/versioned-renewal-verification.json`.

The public frontend [https://pulsep.vercel.app/](https://pulsep.vercel.app/) serves `public/deployment.json` with this v0.4 address, chain ID 61999 and matching source hash. Anonymous HTTP requests to `/`, `/pacts/new/`, `/pacts/view/`, and `/activity/` returned 200. Browser-driven wallet verification and responsive visual QA have not been verified. The versioned-renewal live proof remains incomplete because the two current unresolved periods have not reached their evidence deadlines and validators have not agreed on a classification. Studionet GEN is simulated.
