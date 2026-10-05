# Stable Studionet deployment record

## Canonical v0.3 deployment

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

The app reads `public/deployment.json`; no Vercel address environment variable is used. That local JSON now points to v0.3. The canonical frontend is [https://pulsep.vercel.app/](https://pulsep.vercel.app/), but its production deployment has not been verified against this v0.3 binding. Do not infer production guard success from the local binding.

The v0.3 code/evidence/docs have not been pushed because available GitHub credentials are invalid. No GitHub Actions result exists for the v0.3 commit. See `public/verification.json` for the exact status and limitations.
