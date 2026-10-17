# Stable Studionet deployment record

## Active v0.5 deployment and completed two-period proof

- Network: stable Studionet, chain ID `61999`; RPC `https://studio.genlayer.com/api`.
- Repository-local CLI: `genlayer@0.39.1`; compatible `genlayer-js@1.1.8`.
- Active contract: [`0x60Bf858706D623C733199AC9c1648f789d35733E`](https://explorer-studio.genlayer.com/address/0x60Bf858706D623C733199AC9c1648f789d35733E).
- Deployment transaction: [`0x6da71244307f1cce6b6915f7e7649e31b34c482c562817fc513edcba215d7093`](https://explorer-studio.genlayer.com/tx/0x6da71244307f1cce6b6915f7e7649e31b34c482c562817fc513edcba215d7093), FINALIZED, SUCCESS, MAJORITY_AGREE (5 validators).
- Normalized-LF source SHA-256: `734b2e48ec60a6434ef29981fbbefbc0e4b2c3ebf344716fc1bcb33bb4b23ffa`; deployed source read-back matches. `get_config()` reports `pulsep.v0.5`, `studionet-only`, and `admin=null`.
- Pact `PULSE-V05-MILESTONE-20261017-01` completed v1 and v2 periods. Proposal `0x39daed3017fb0a8404a29c7b65a53b492f093bbbb250b6f489449c73c2f20d7f`; period-1 funding `0xd4efda691f61eb5a8210b9d8f8328ee5f5b13b9ed8cb21b143ff034a95c5364e`; v2 proposal `0xd1507df2c59a8d6d9ee1c643296d495dd70daa0ecdb7d6803674964fb2f0c976`; bilateral approval `0xf3608493f661c19d5cff1c23cf0ec9cdd1f0d5984664ac27e8ffd913e18274d3`.
- Period 1 assessment settled `NO_BREACH`: `0xca100581d6a6cf5f811ec631eeb0ce010ef6660e7c597d9b0904d651740661f3`. Period-2 funding atomically activated v2: `0xf4c7fe53cebe390d30ffaf1d47a8913ce90edc993bc6fb7ff5ce25f21538b04e`. Period 2 settled `NO_BREACH`: `0x6cbeb47796a1e2e182ac4fe86d1fe71be58e2ef2db4d35b53cbdae57854a1612`.
- Each bond was `1000000000000000` wei. Period 1 and 2 each credited customer `0` and provider `1000000000000000` wei. Customer aggregate: deposited/credited `2000000000000000`, locked/withdrawn/claimable `0`. Provider aggregate: deposited/credited `2000000000000000`, locked/withdrawn `0`, claimable `2000000000000000`. Contract balance: `2000000000000000` wei. No v0.5 withdrawal is claimed.
- The evidence records are synthetic and commit-pinned at `db1217201bc57b72e8a0d28d4d22fcce1dbdaa78`; they do not describe a real provider incident. Exact source digests, period windows, version digests, validator receipts and accounting snapshots are in `public/versioned-renewal-verification.json`.
- Production frontend: [https://pulsep.vercel.app/](https://pulsep.vercel.app/). The public manifest reports v0.5, chain 61999 and the matching source digest; `/`, `/pacts/new`, `/pacts/view`, and `/activity` returned anonymous HTTP 200. Browser-wallet execution was not verified.

Studionet GEN is simulated. Historical v0.2/v0.4 deployments and their disagreements remain preserved below and in the verification records.

## Historical v0.3 deployment

This is the preserved original deployment and completed lifecycle proof. It is superseded by the active v0.5 contract above.

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

The app reads `public/deployment.json`; no Vercel address environment variable is used. At the time this historical v0.3 proof was recorded, that manifest pointed to v0.3. Current production binding is documented in the active v0.5 section above.

## Historical v0.4 deployment and unresolved attempts

- Network: stable Studionet, chain ID `61999`; RPC `https://studio.genlayer.com/api`.
- Repository-local CLI: `genlayer@0.39.1`.
- Contract: [`0x5B5dDeeaDBfCc2075A7E75401202E259a076f9Cf`](https://explorer-studio.genlayer.com/address/0x5B5dDeeaDBfCc2075A7E75401202E259a076f9Cf).
- Deployment transaction: [`0xe6ac4004f06780953c9edcdaca61e7b90bc407c9bd0d5614bfe6a8abe23f4ef8`](https://explorer-studio.genlayer.com/tx/0xe6ac4004f06780953c9edcdaca61e7b90bc407c9bd0d5614bfe6a8abe23f4ef8), FINALIZED, SUCCESS, MAJORITY_AGREE (5 validators).
- Normalized-LF source SHA-256: `a03b0b5b509af6648dfa95125594e5fd2ce01532de839dbb2bcf1f9e9c3df3c3`; read-back matched local source exactly.
- `get_config()`: `version=pulsep.v0.4`, `network_scope=studionet-only`, `admin=null`, `max_sla_versions=8`, `revision_expiry_seconds=86400`.
- Deployed schema: 21 methods (9 views, 12 writes), including all four revision writes.
- Historical v0.4 attempts: on `PULSE-WALLET-LIVE-20261017-01`, period 1 settled `NO_BREACH`; the provider withdrew exactly `0.001 GEN`, and a finalized outbound transfer receipt and balance delta were recorded. The same pact accepted version 2 and funded period 2, but four assessments ended in `MAJORITY_DISAGREE`, leaving that historical bond locked. A separate criteria-proof pact completed a v1 settlement and withdrawal. The separate original v0.4 pact period 1 also remained funded after `UNDETERMINED / MAJORITY_DISAGREE`. These are preserved historical outcomes, not the v0.5 proof. Receipts, source digests and accounting remain in `public/versioned-renewal-verification.json`.

The v0.4 contract and its unresolved validator disagreements are historical and are not the active frontend target. Their receipts remain in `public/versioned-renewal-verification.json`. The active production manifest now binds v0.5 as recorded above.
