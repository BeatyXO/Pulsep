# Versioned SLA Renewals — milestone evidence

## Baseline and comparison

- Verified pre-milestone `main` HEAD: `fc667a11fcc467b99cdd7d68bf5bb745445b620d`.
- The official accepted submission commit could not be confirmed from repository tags, handoff files, or submission records. Candidate SHA `fc667a11fcc467b99cdd7d68bf5bb745445b620d` remains explicitly unverified; the same SHA is preserved separately as the pre-milestone HEAD.
- Evidence commit `1863b4ad9850543a6497b8db4a9db8d05e467c1a`; [compare with the pre-milestone HEAD](https://github.com/BeatyXO/Pulsep/compare/fc667a11fcc467b99cdd7d68bf5bb745445b620d...1863b4ad9850543a6497b8db4a9db8d05e467c1a). The officially accepted submission baseline remains unverified.
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

Current milestone checks have passed locally: Python compile, Direct Mode/source invariants 34/34, GenVM lint 0.11.0 on runner v0.2.16, TypeScript typecheck, Vitest 19/19, Next.js static production build, and actual-contract mutation checks 4/4 killed. The mutation variants weaken counterparty authorization, period version binding, atomic revision activation and settlement conservation; each corresponding Direct Mode lifecycle test detects the defect. Final CI for the release commit is pending.

## Deployment and live evidence

The v0.4 contract is deployed and verified on stable Studionet:

- Contract: [`0x5B5dDeeaDBfCc2075A7E75401202E259a076f9Cf`](https://explorer-studio.genlayer.com/address/0x5B5dDeeaDBfCc2075A7E75401202E259a076f9Cf).
- Deployment transaction: [`0xe6ac4004f06780953c9edcdaca61e7b90bc407c9bd0d5614bfe6a8abe23f4ef8`](https://explorer-studio.genlayer.com/tx/0xe6ac4004f06780953c9edcdaca61e7b90bc407c9bd0d5614bfe6a8abe23f4ef8), FINALIZED, SUCCESS, MAJORITY_AGREE with five validators.
- Normalized-LF source SHA-256: `a03b0b5b509af6648dfa95125594e5fd2ce01532de839dbb2bcf1f9e9c3df3c3`; the deployed source read-back matches exactly.
- `get_config()` reports `pulsep.v0.4`, `studionet-only`, `admin=null`, 8 maximum SLA versions and a 24-hour revision expiry. The deployed schema has 21 methods.
- Live pact `PULSE-V04-RENEWAL-20261017-01` is proposed and funded at exactly `0.001 GEN`. Period 1 snapshots version 1; the approved version 2 was activated atomically on the separate wallet-test pact when period 2 was funded.
- Proposal, funding, revision and approval transactions, period timestamps and fixture digests are recorded in `public/versioned-renewal-verification.json`.

The versioned-renewal proof is incomplete. A separate criteria-proof pact `PULSE-CRITERIA-LIVE-20261017-01` completed a full version-1 `NO_BREACH` settlement, provider withdrawal, finalized outbound transfer, and exact balance reconciliation using the pinned synthetic fixtures. Wallet-test pact `PULSE-WALLET-LIVE-20261017-01` completed period 1 as `NO_BREACH`; provider withdrawal and its finalized outbound transfer are recorded. The same pact activated approved SLA version 2 and funded period 2. Four assessment calls ended in `MAJORITY_DISAGREE`, leaving period 2 `FUNDED` with the 0.001 GEN bond locked. On the separate original pact `PULSE-V04-RENEWAL-20261017-01`, period 1 remains `FUNDED`; an additional assessment ended `UNDETERMINED / MAJORITY_DISAGREE`. At the latest read, both evidence deadlines were still future, so deterministic expiry recovery was not eligible. No result, credit, recovery or withdrawal is claimed for either unresolved period. Receipt hashes, source evidence, timing and accounting are in `public/versioned-renewal-verification.json`. The earlier completed v0.3 `NO_BREACH` lifecycle remains in `public/verification.json`.

## Frontend and CI

The milestone frontend has passed local build/test checks. Anonymous HTTPS requests to `https://pulsep.vercel.app/`, `/pacts/new/`, `/pacts/view/`, and `/activity/` returned HTTP 200. The production `/deployment.json` reports v0.4, chain 61999, the new address and verified source hash. The in-app and Chrome browser surfaces returned `ERR_BLOCKED_BY_CLIENT`; visual responsive checks and browser-wallet actions are not claimed. CSS includes 980px and 680px responsive breakpoints. GitHub Actions passed for evidence commit `1863b4a` at [run 39061708882](https://github.com/BeatyXO/Pulsep/actions/runs/39061708882); both frontend and contract jobs are green.

## Limitations

- Studionet GEN is simulated.
- No independent audit or production safety claim is made.
- Original accepted submission baseline remains unverified.
- A version-2 renewal was funded, but period 2 has not settled because four validator assessments disagreed. The separate original pact period 1 is also unresolved. Expiry recovery cannot be submitted before the recorded evidence deadlines. No full v0.4 renewal settlement cycle or live negative-transition set is claimed.
