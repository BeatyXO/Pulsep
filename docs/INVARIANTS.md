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

## Accounting invariants

1. `locked + credited + withdrawn` reconciles against deposits subject to outbound finalization semantics.
2. A settled period removes exactly one period bond from `locked`.
3. Customer credit + provider credit equals the period bond.
4. Withdraw zeroes the caller's credit before emitting the outbound transfer.
5. One caller cannot withdraw another wallet's credit.
