# Pulsep invariants

## Pact invariants

1. Customer and provider are different nonzero EVM addresses.
2. A pact ID is unique.
3. Provider cannot be changed after proposal.
4. SLA clauses, tier rules, settlement bps, evidence sources, period duration and bond are immutable after proposal.
5. Minor customer bps < major customer bps < severe customer bps <= 10,000.
6. A pact has at least one `PROVIDER` source and one `INDEPENDENT` source.
7. Evidence URLs use HTTPS and reject obvious local/private targets.
8. Only the designated provider can activate a proposal.
9. Provider activation requires exactly the frozen bond.
10. Only the customer can cancel an unaccepted proposal.

## Period invariants

1. A period begins only from an exact provider bond deposit.
2. A new period cannot be funded until the preceding period is terminal.
3. Assessment cannot occur before the 5 minute post-period evidence-maturity window.
4. Assessment cannot occur after evidence-window expiry.
5. `INCONCLUSIVE` reassessment is limited by the evidence deadline and a deterministic 5 minute cooldown, not a fixed attempt cap.
6. `INDEPENDENT` means a source role declared by the customer and accepted by the provider in frozen pact terms; the contract does not authenticate external ownership or independence.
7. Available independent evidence is the agreed evidence anchor; an unavailable provider source alone cannot veto an independently supported breach.
8. Breach tiers require an independently supporting `BREACH` or `MIXED` finding; `NO_BREACH` requires an exact quoted coverage statement and `NO_BREACH` finding from an independent source covering the full period.
9. `INCONCLUSIVE` never transfers or credits bond value.
10. A terminal period cannot settle twice.
11. Evidence-window expiry never manufactures a breach; unresolved bond returns to provider credit.
12. Closing a pact cannot strand an active funded period.

## Consensus invariants

1. Web content is untrusted data.
2. Every consequential source finding quote must exist in the fetched source body.
3. Unavailable source cannot be represented as available evidence.
4. Validator comparison binds the complete normalized assessment, including reason, quotes, coverage/freshness, timeline, exclusion reasoning, provenance and period boundaries.
5. The LLM has no accepted schema fields for recipients or payout bps.
6. Assessment comparison binds the funded period's SLA version number and canonical policy digest; arbitrary narrative wording is not a decision fact.

## Versioned renewal invariants

1. Version 1 is the original accepted semantic policy; version numbers increase by exactly one and are capped at 8.
2. Every complete policy snapshot is append-only under its pact/version identity and has a SHA-256 digest over canonical sorted-key JSON.
3. A period stores its full policy snapshot, SLA version, and digest at funding; later revisions cannot change that record.
4. A revision can change only service scope, SLA clauses, tier meanings, and source IDs/roles/URLs/scopes. Customer, provider, service identity, period duration, bond, and payout basis points stay fixed.
5. A revision requires 2–4 valid sources including provider and independent roles; sources are revalidated with the same URL/ID/role rules as an initial pact.
6. At most one pending revision exists. Proposals are bound to pact, proposer, base/next versions, monotonic nonce, exact policy digest, creation time, and 24-hour expiry.
7. Only the other designated party may approve the exact proposal ID, base version, and digest before expiry. Approval replay, wrong-pact approval, stale base, superseded IDs, and digest mismatch fail.
8. Only the proposer can cancel. Expiry clearing is permissionless and cannot approve the revision.
9. An unapproved pending proposal does not prevent a renewal under the current version. An approved unexpired revision activates atomically in the payable next-period funding call. Expired approval makes that call revert without consuming bond or approval.
10. Funding activation, period version binding, and active-version update occur in one contract transaction; no intermediate signing gap exists.
11. Assessment, reassessment, and unresolved expiry use only the period's saved policy, including its source URLs and meanings.
12. Audit history records proposal, approval, replacement, cancellation, expiry and activation; each pact retains at most 64 revision events.

## Accounting invariants

1. `locked + credited + withdrawn` reconciles against deposits subject to outbound finalization semantics.
2. A settled period removes exactly one period bond from `locked`.
3. Customer credit + provider credit equals the period bond.
4. Withdraw zeroes the caller's credit before emitting the outbound transfer.
5. One caller cannot withdraw another wallet's credit.
