# Pulsep build status — Versioned SLA Renewals

## Completed v0.5 milestone

- Source-verified v0.5 contract deployed to stable Studionet 61999: `0x60Bf858706D623C733199AC9c1648f789d35733E`.
- Deployment transaction `0x6da71244307f1cce6b6915f7e7649e31b34c482c562817fc513edcba215d7093` finalized successfully. Deployed source read-back matches normalized-LF SHA-256 `734b2e48ec60a6434ef29981fbbefbc0e4b2c3ebf344716fc1bcb33bb4b23ffa`.
- `get_config()` confirms `pulsep.v0.5`, `studionet-only`, and `admin=null`.
- One live pact completed SLA v1 assessment/settlement, bilateral approval of v2, atomic v2 activation on period 2 funding, and v2 assessment/settlement after the full period and maturity delay.
- Both synthetic periods settled `NO_BREACH`; each 0.001 GEN period bond credited 100% to the provider. Aggregate deposits and credits are 0.002 GEN; locked funds are zero. Credits remain claimable; no withdrawal was part of this v0.5 proof.
- Final v0.5 transaction receipts and policy digests are in `public/versioned-renewal-verification.json`. Earlier v0.2/v0.4 disagreements remain preserved as historical evidence.

## Verification

- Repository-local GenLayer CLI: `0.39.1`.
- GenVM lint: PASS, 3 checks; pinned runner v0.2.16.
- Direct Mode: PASS, 37 tests.
- Actual-contract mutation checks: PASS, 10/10 weakened-source mutants killed.
- Python compile: PASS.
- Frontend typecheck: PASS; Vitest: 19/19; production build: PASS.
- GitHub Actions for manifest commit `878977113136e0746276462661e9fd3939e408d4`: [run 39070496982](https://github.com/BeatyXO/Pulsep/actions/runs/39070496982), PASS. A final documentation commit will trigger a further run.
- Production frontend `https://pulsep.vercel.app/` serves the v0.5 manifest. `/`, `/pacts/new`, `/pacts/view`, and `/activity` returned anonymous HTTP 200.
- Browser injected-wallet execution was not performed. Studionet GEN is simulated. The official accepted submission baseline remains unverified; `fc667a11fcc467b99cdd7d68bf5bb745445b620d` is the recorded pre-milestone HEAD only.

## Preserved baseline

- Pre-milestone repository HEAD: `fc667a11fcc467b99cdd7d68bf5bb745445b620d`.
- The repository has no authoritative acceptance record; this SHA is not claimed as officially accepted.
- Historical v0.3 and v0.4 deployments, receipts, and unresolved disagreement records remain in the deployment and verification history.

This prototype is not independently audited, bug-free, production-safe, real-money settlement, or legally binding arbitration.
