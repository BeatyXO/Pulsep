# Versioned SLA Renewals — milestone evidence

## Baseline and comparison

- Verified pre-milestone `main` HEAD: `fc667a11fcc467b99cdd7d68bf5bb745445b620d`.
- The official accepted submission commit could not be confirmed from repository tags, handoff files, or submission records. Candidate SHA `fc667a11fcc467b99cdd7d68bf5bb745445b620d` remains explicitly unverified; the same SHA is preserved separately as the pre-milestone HEAD.
- Final milestone commit and compare link: pending.
- Historical v0.3 contract and its prior NO_BREACH proof remain preserved in the existing deployment/verification records.

## Existing Pulsep functionality preserved

Pulsep remains one Intelligent Contract plus a direct-wallet Next.js App Router frontend. It retains recurring funded periods, frozen provider and independent evidence roles, validator web re-fetch and independent semantic classification, NO_BREACH/MINOR/MAJOR/SEVERE/INCONCLUSIVE, deterministic payout basis points, nonterminal inconclusive reassessment, unresolved recovery, withdrawals, and no admin verdict override. The model does not choose recipients or payout amounts.

## New functionality implemented in source

- The original pact policy is version 1; each pact permits at most 8 versions.
- A full semantic policy and canonical digest are stored independently by pact/version. A period snapshots its complete policy, version number and digest at funding.
- Either party can propose permitted future changes to service scope, SLA clauses, tier rules, and source policy. Parties, service identity, duration, bond, and payout basis points cannot be changed.
- Exactly one pending proposal exists at a time. The counterparty approves the pact/proposal/base-version/digest binding. Proposals expire after 24 hours; stale, replaced, cancelled, replayed, wrong-pact, wrong-base and mismatched-digest approvals fail.
- Approved revisions activate only in the atomic next-period funding call. Unapproved proposals do not block a renewal under the current version. Expired approvals block renewal until fresh approval, without consuming value or approval state.
- Assessment, retries and expiry recovery use the period's exact original policy and evidence URLs. Consensus binds version and digest along with consequential findings and provenance.
- Revision audit history records proposal, approval, supersession, cancellation, expiry and activation; maximum 64 events. Bounded read methods expose version records and event pages.
- Pact detail presents period/current versions, pending state, digest, expiry, role/state-gated actions, readable policy editor/diff, and immutable version history.

## Local verification

Current milestone checks have passed: Python compile, Direct Mode/source invariants 34/34, GenVM lint 0.11.0 on runner v0.2.16, TypeScript typecheck, Vitest 8/8, and Next.js static production build. These must be rerun on the final commit. Contract negative-transition coverage is present; a source-mutation harness has not been run and is not claimed.

## Deployment and live evidence

The v0.4 contract has not yet been deployed in this evidence file. Address, deployment transaction, source hash/read-back, config and explorer link remain pending until observed. Required live two-period lifecycle and negative approval receipts also remain pending; do not infer that local tests establish them. The original v0.3 deployment and one completed NO_BREACH cycle are preserved in `public/verification.json`.

## Frontend and CI

The milestone frontend has passed local build/test checks. The production URL `https://pulsep.vercel.app/` is not yet verified to serve a v0.4 manifest. Browser wallet actions are not claimed. CI and Vercel evidence links remain pending until completed.

## Limitations

- Studionet GEN is simulated.
- No independent audit or production safety claim is made.
- Original accepted submission baseline remains unverified.
- Two-version live proof, adversarial live receipts, final GitHub Actions status, and production frontend verification remain outstanding.
