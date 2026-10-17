# Pulsep submission

## Name
Pulsep

## One-liner
Recurring GenLayer reliability pacts where validators independently assess frozen public SLA evidence and contract code deterministically settles each period.

## Product

Pulsep is a recurring SLA reliability protocol on GenLayer Studionet. A customer freezes the covered service, SLA clauses, breach tiers, public evidence policy, period duration, provider bond, and payout basis points before provider acceptance. After a service period and evidence-maturity window, validators independently retrieve frozen sources and substantively classify the period as `NO_BREACH`, `MINOR`, `MAJOR`, `SEVERE`, or `INCONCLUSIVE`. The model never selects recipients or amounts. Contract code applies the precommitted split. `INCONCLUSIVE` keeps funds locked for bounded reassessment and deterministic unresolved recovery. The same pact can renew for later periods.

## Versioned SLA Renewals milestone

**Status:** Completed with a source-verified v0.5 Studionet deployment and a successful two-period live proof.

**Copy-ready milestone description (under 1,000 characters):**

> Pulsep adds mutually approved, versioned SLA renewals to its recurring GenLayer settlement pact. Either party may propose future service-scope, SLA-clause, tier-rule, or evidence-source changes; only the designated counterparty can approve the exact proposal ID, base version, and canonical policy digest before expiry. Approval leaves funded periods unchanged. The next renewal atomically activates the approved policy and binds its full snapshot and digest to the new period. On stable Studionet, one pact completed a v1 NO_BREACH settlement, bilateral v2 approval, atomic v2 activation, and a v2 NO_BREACH settlement after the full service and evidence-maturity windows. Validators fetched commit-pinned synthetic provider and independent records; contract code issued deterministic credits from frozen terms. The model never selects amounts or recipients.

**Pre-milestone HEAD:** `fc667a11fcc467b99cdd7d68bf5bb745445b620d`. This is not claimed as the officially accepted submission baseline; acceptance remains unverified.

**Final Git commit / compare URL:** The final commit is the GitHub `main` HEAD for this submission; compare from the recorded pre-milestone HEAD. The exact SHA and compare URL are included in the closeout report.

**Active contract:** [`0x60Bf858706D623C733199AC9c1648f789d35733E`](https://explorer-studio.genlayer.com/address/0x60Bf858706D623C733199AC9c1648f789d35733E), stable Studionet chain 61999.

**Deployment:** [`0x6da71244307f1cce6b6915f7e7649e31b34c482c562817fc513edcba215d7093`](https://explorer-studio.genlayer.com/tx/0x6da71244307f1cce6b6915f7e7649e31b34c482c562817fc513edcba215d7093), FINALIZED / SUCCESS. Normalized-LF source SHA-256: `734b2e48ec60a6434ef29981fbbefbc0e4b2c3ebf344716fc1bcb33bb4b23ffa`; deployed read-back matches.

**Live proof:** Pact `PULSE-V05-MILESTONE-20261017-01` completed period 1 v1 settlement, v2 proposal and bilateral approval, atomic v2 activation on period 2 funding, and period 2 v2 semantic assessment and settlement. Receipts, version digests, validator information, pinned source digests and exact accounting are in `MILESTONE_EVIDENCE.md` and `public/versioned-renewal-verification.json`.

**Frontend:** [https://pulsep.vercel.app/](https://pulsep.vercel.app/). Production manifest verified against the v0.5 contract and source digest; anonymous route checks returned HTTP 200 for `/`, `/pacts/new`, `/pacts/view`, and `/activity`.

**Verification:** GenVM lint PASS; Direct Mode PASS (37 tests); actual-contract mutations PASS (10/10); frontend typecheck, 19 tests, and production build PASS. CI for the preceding manifest commit passed at [run 39070496982](https://github.com/BeatyXO/Pulsep/actions/runs/39070496982); a new run is required for the final documentation commit.

**Limitations:** Studionet GEN is simulated. The evidence fixtures are synthetic. Browser injected-wallet execution was not performed. Official accepted submission baseline is unverified. Pulsep is not represented as independently audited, production-safe, real-money settlement, or legally binding arbitration.

## Links

- GitHub: https://github.com/BeatyXO/Pulsep
- Website: https://pulsep.vercel.app/
- Active contract: https://explorer-studio.genlayer.com/address/0x60Bf858706D623C733199AC9c1648f789d35733E
- Historical v0.3 lifecycle evidence: `public/verification.json`
- Historical v0.2/v0.4 and final v0.5 evidence: `public/versioned-renewal-verification.json`
