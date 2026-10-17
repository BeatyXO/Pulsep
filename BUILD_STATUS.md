# Pulsep build status — Versioned SLA Renewals

## Preserved baseline

- Pre-milestone repository HEAD verified locally: `fc667a11fcc467b99cdd7d68bf5bb745445b620d`.
- The repository has no accepted-baseline tag or authoritative acceptance record. `fc667a1` is preserved as the pre-milestone point, not described as the officially accepted submission.
- The historical v0.3 contract and completed NO_BREACH transaction proof remain in `public/deployment.json` and `public/verification.json`.

## Milestone implementation (local)

- Contract source is being extended in the existing one-contract architecture; intended protocol version is `pulsep.v0.4`.
- SLA version 1 freezes the original semantic policy. Up to eight versions are stored separately with full policy and canonical digest; periods store their own full source/policy snapshot, version number and digest.
- Either party may propose permitted future terms; only the exact counterparty approves the proposal ID, base version and policy digest. Proposals expire after 24 hours. Pending state is single-entry; audit events are capped at 64 per pact.
- An approved revision activates only in the atomic next-period payable call. Parties, service identity, period duration, bond and payout bps cannot be revised.
- Contract reads expose version records and paginated revision events. Pact detail UI includes the editor, exact digest approval, expiry/cancel/replacement status, period version, immutable history, and before/after policy presentation.
- No v0.4 deployment or two-period live proof has yet been recorded.

## Local verification

- Repository-local GenLayer CLI installed and reports `0.39.1`.
- Python compile: PASS.
- Direct Mode plus source invariants: PASS, 34 cases.
- GenVM lint 0.11.0 with stable runner v0.2.16: PASS; 21 contract methods (9 views, 12 writes).
- TypeScript typecheck: PASS.
- Vitest: 8/8 PASS.
- Next.js production build: PASS for routes `/`, `/activity`, `/pacts/new`, and `/pacts/view`.
- Final preflight awaits generated-file cleanup and actual v0.4 deployment evidence.
- GitHub Actions for the milestone commit and Vercel production binding remain pending.

Studionet GEN is simulated. This prototype is not independently audited, bug-free, production-safe, real-money settlement, or legal arbitration.
