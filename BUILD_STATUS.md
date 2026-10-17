# Pulsep build status — Versioned SLA Renewals

## Preserved baseline

- Pre-milestone repository HEAD verified locally: `fc667a11fcc467b99cdd7d68bf5bb745445b620d`.
- The repository has no accepted-baseline tag or authoritative acceptance record. `fc667a1` is preserved as the pre-milestone point, not described as the officially accepted submission.
- The historical v0.3 contract and completed NO_BREACH transaction proof remain in `public/deployment.json` and `public/verification.json`.

## Milestone implementation

- Version `pulsep.v0.4` is deployed to stable Studionet and source-readback verified.
- SLA version 1 freezes the original semantic policy. Up to eight versions are stored separately with full policy and canonical digest; periods store their own full source/policy snapshot, version number and digest.
- Either party may propose permitted future terms; only the exact counterparty approves the proposal ID, base version and policy digest. Proposals expire after 24 hours. Pending state is single-entry; audit events are capped at 64 per pact.
- An approved revision activates only in the atomic next-period payable call. Parties, service identity, period duration, bond and payout bps cannot be revised.
- Contract reads expose version records and paginated revision events. Pact detail UI includes the editor, exact digest approval, expiry/cancel/replacement status, period version, immutable history, and before/after policy presentation.
- The versioned-renewal live proof is incomplete. On pact `PULSE-WALLET-LIVE-20261017-01`, period 1 settled `NO_BREACH` and the provider withdrew its exact 0.001 GEN credit; the same pact then activated approved SLA version 2 and funded period 2. Four period-2 assessments ended in `MAJORITY_DISAGREE`; period 2 remains `FUNDED` with its bond locked. The separate original pact period 1 also remains `FUNDED` after disagreement. Both evidence deadlines are still in the future, so expiry recovery cannot yet be called. Current receipts and accounting are in `public/versioned-renewal-verification.json`.

## Local verification

- Repository-local GenLayer CLI installed and reports `0.39.1`.
- Python compile: PASS.
- Direct Mode plus source invariants: PASS, 34 cases.
- GenVM lint 0.11.0 with stable runner v0.2.16: PASS; 21 contract methods (9 views, 12 writes).
- TypeScript typecheck: PASS.
- Vitest: 19/19 PASS, including injected wallet, network, deployment/source guard, pending hash recovery and ambiguous send cases.
- Next.js production build: PASS for routes `/`, `/activity`, `/pacts/new`, and `/pacts/view`.
- Actual-contract mutation check: PASS, 4/4 weakened source variants killed (counterparty authorization, period version binding, atomic activation, settlement conservation).
- GitHub Actions last passed on commit `348e7e113dab54a14aecd84d6ad5ac7c4792be55`: [run 39036674641](https://github.com/BeatyXO/Pulsep/actions/runs/39036674641). The latest evidence update requires a new run.
- Production Vercel serves a v0.4 manifest for the verified Studionet contract; homepage and `/pacts/new/`, `/pacts/view/`, `/activity/` return HTTP 200 to anonymous requests.
- Browser-wallet execution and visual desktop/tablet/mobile QA remain unverified; responsive breakpoints are present in the stylesheet.

Studionet GEN is simulated. This prototype is not independently audited, bug-free, production-safe, real-money settlement, or legal arbitration.
