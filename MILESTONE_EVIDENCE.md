# Versioned SLA Renewals — final milestone evidence

## Final result

The v0.5 contract is deployed to stable Studionet and source-readback verified. One pact completed period 1 under policy version 1, bilateral approval of policy version 2, atomic activation of version 2 at period-2 funding, and a successful version-2 semantic assessment and settlement. Both periods met the full service duration and evidence-maturity delay. The receipts below are finalized chain records; no earlier v0.2/v0.4 disagreement has been erased or relabeled.

## Baseline, source, and deployment

- Recorded pre-milestone HEAD: `fc667a11fcc467b99cdd7d68bf5bb745445b620d`. It is not claimed as an officially accepted submission baseline; no authoritative acceptance record was found.
- Active contract: [`0x60Bf858706D623C733199AC9c1648f789d35733E`](https://explorer-studio.genlayer.com/address/0x60Bf858706D623C733199AC9c1648f789d35733E), stable Studionet, chain `61999`, RPC `https://studio.genlayer.com/api`.
- Deployment transaction: [`0x6da71244307f1cce6b6915f7e7649e31b34c482c562817fc513edcba215d7093`](https://explorer-studio.genlayer.com/tx/0x6da71244307f1cce6b6915f7e7649e31b34c482c562817fc513edcba215d7093), FINALIZED, SUCCESS, MAJORITY_AGREE, five validators.
- Repository-local CLI `0.39.1`; `genlayer-js` `1.1.8`.
- Normalized-LF source SHA-256: `734b2e48ec60a6434ef29981fbbefbc0e4b2c3ebf344716fc1bcb33bb4b23ffa`. Deployed source read-back exactly matched. `get_config()` reported `pulsep.v0.5`, `network_scope=studionet-only`, `admin=null`; deployed schema exposes 21 methods.
- Release lineage: consensus-normalization implementation `87eb51e440ccbc53eb3ff1ba1c4a6526209dcb26`; production manifest binding was pushed in `878977113136e0746276462661e9fd3939e408d4`. Final documentation commit SHA and compare URL are recorded in the GitHub release history after push.

## Successful v1 → v2 lifecycle

Pact `PULSE-V05-MILESTONE-20261017-01`; customer `0x39680bd423437C0Eaa18493629652821Ec672C61`; provider `0xA49c51d759790116D451f256654dD9F0549D341F`; period bond `1000000000000000` wei (0.001 simulated GEN); each service period 900 seconds with 300 seconds evidence maturity.

| Action | Finalized transaction | Observed result |
|---|---|---|
| Propose pact | `0x39daed3017fb0a8404a29c7b65a53b492f093bbbb250b6f489449c73c2f20d7f` | SUCCESS; MAJORITY_AGREE |
| Provider accepts and funds period 1 | `0xd4efda691f61eb5a8210b9d8f8328ee5f5b13b9ed8cb21b143ff034a95c5364e` | SUCCESS; exact 0.001 GEN |
| Customer proposes v2 | `0xd1507df2c59a8d6d9ee1c643296d495dd70daa0ecdb7d6803674964fb2f0c976` | SUCCESS; proposal `5f60544abb02f8bc9406e4578dbc321f9a4b14c0483f4f7f44ce2ad46719f3af` |
| Provider approves exact revision | `0xf3608493f661c19d5cff1c23cf0ec9cdd1f0d5984664ac27e8ffd913e18274d3` | SUCCESS; v2 digest `c441ab124c28ec49614cc7cd697965c8b489537af4b32dcd4b64cdc198e97341` |
| Assess and settle period 1 | `0xca100581d6a6cf5f811ec631eeb0ce010ef6660e7c597d9b0904d651740661f3` | FINALIZED SUCCESS; `NO_BREACH`; v1 digest `eb181ffec225d6366045b56d41681e578ca5d670530f3bf4ab78b7d96e525dc3`; two rounds |
| Fund period 2 / atomically activate v2 | `0xf4c7fe53cebe390d30ffaf1d47a8913ce90edc993bc6fb7ff5ce25f21538b04e` | SUCCESS; period 2 snapshots v2 digest exactly |
| Assess and settle period 2 | `0x6cbeb47796a1e2e182ac4fe86d1fe71be58e2ef2db4d35b53cbdae57854a1612` | FINALIZED SUCCESS; `NO_BREACH`; v2 digest matches; one round |

Period 1 was funded at Unix `1792271783`, ended `1792272683`, opened for assessment at `1792272983`, and settled at `1792272985`. Period 2 was funded at `1792273074`, ended `1792273974`, opened at `1792274274`, and settled at `1792274276`. Period 1 and version history remain immutable; the revision audit records proposal, approval, activation, and the v2 snapshot on the second period.

The period-1 last-round validator votes were `[IDLE, AGREE, AGREE, AGREE, IDLE]`; period 2 votes were `[AGREE, AGREE, AGREE, IDLE, IDLE]`. Receipts report MAJORITY_AGREE and successful leader execution. Full validator addresses, per-period state, and assessment findings are in `public/versioned-renewal-verification.json`.

## Pinned synthetic evidence

All records are synthetic demonstration fixtures, pinned to commit `db1217201bc57b72e8a0d28d4d22fcce1`, with a stated evidence window of 2026-10-17 00:00 UTC through 2026-10-18 00:00 UTC. They do not describe a production provider or real incident.

| Version / role | Immutable public URL | SHA-256 |
|---|---|---|
| v1 provider | https://raw.githubusercontent.com/BeatyXO/Pulsep/db1217201bc57b72e8a0d28d4d22fcce1dbdaa78/public/evidence/versioned-renewals/v1-provider.json | `897f309ab2445fe370a578675eebc41e7663caad13f3885895e6bd886f9c63cb` |
| v1 independent | https://raw.githubusercontent.com/BeatyXO/Pulsep/db1217201bc57b72e8a0d28d4d22fcce1dbdaa78/public/evidence/versioned-renewals/v1-independent.json | `fd67c76cedde845f91297c25d082adf0c663a59454bcf775c1dbe8a4c562038d` |
| v2 provider | https://raw.githubusercontent.com/BeatyXO/Pulsep/db1217201bc57b72e8a0d28d4d22fcce1dbdaa78/public/evidence/versioned-renewals/v2-provider.json | `fdf147ee2e9c0d502c6284c0c452d0cdd773e9806e45b54abbe0c79865193a1e` |
| v2 independent | https://raw.githubusercontent.com/BeatyXO/Pulsep/db1217201bc57b72e8a0d28d4d22fcce1dbdaa78/public/evidence/versioned-renewals/v2-independent.json | `082170251a40bd9b69c04b1fc3061969cb0c51fba0be6fdf03d95384cf55abd5` |

Validators fetched both frozen sources for each period; both returned HTTP 200, and recorded body digests match the pinned fixture hashes. The v2 decision findings and quotes are stored in the machine-readable verification record.

## Economic reconciliation

- Two funded periods: total deposited `2000000000000000` wei.
- Period credits: customer `0 + 0` wei; provider `1000000000000000 + 1000000000000000` wei.
- Aggregate accounting: customer deposited/credited `2000000000000000`, locked `0`, withdrawn `0`, claimable `0`; provider deposited/credited `2000000000000000`, locked `0`, withdrawn `0`, claimable `2000000000000000`.
- Contract balance after both settlements: `2000000000000000` wei. It equals claimable provider credits. Credits sum to the two bonds; no v0.5 withdrawal or outbound transfer is claimed.

## Verification and frontend

- GenVM lint: PASS (three checks; runner v0.2.16); Direct Mode: PASS (37 tests); Python compile: PASS.
- Actual-contract mutation suite: PASS (10/10 mutants killed), including authorization, version/digest binding, atomic activation, conservation, quote grounding, and decision-critical classification/coverage/exclusion/timing checks.
- Frontend: typecheck PASS; Vitest 19/19 PASS; production build PASS.
- GitHub Actions run for the manifest binding commit: [39070496982](https://github.com/BeatyXO/Pulsep/actions/runs/39070496982), PASS. The final documentation commit must also pass CI before submission.
- Production frontend [https://pulsep.vercel.app/](https://pulsep.vercel.app/) serves the matching v0.5 deployment manifest. Anonymous `/`, `/pacts/new`, `/pacts/view`, and `/activity` requests returned HTTP 200.
- Browser injected-wallet execution was not performed. Wallet testing is not claimed.

## Historical records and limitations

- v0.3 deployment and its completed NO_BREACH/withdrawal proof remain in `public/verification.json`.
- v0.2/v0.4 deployments, disagreement receipts, and unresolved historical bonds remain preserved in `public/versioned-renewal-verification.json`; those attempts are explicitly historical and were not deleted or relabeled.
- Studionet GEN is simulated. Evidence is synthetic. The official accepted submission baseline remains unverified. No independent audit, production-safety, real-money settlement, or legal-arbitration claim is made.
