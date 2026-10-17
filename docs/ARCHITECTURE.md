# Pulsep architecture

## System boundary

Pulsep is intentionally:

`USER -> NEXT.JS FRONTEND -> INJECTED WALLET -> GENLAYER INTELLIGENT CONTRACT -> VALIDATORS / PUBLIC WEB EVIDENCE -> CONTRACT STATE -> FRONTEND`

There is no application backend. The frontend can disappear without changing canonical pact state or settlement rights.

## Why one contract

Pulsep keeps one Intelligent Contract because pact terms, policy versions, funded periods, assessment state and settlement credits share one trust boundary. Splitting them would create cross-contract coordination without an independent authority or reuse need.

## Canonical objects

### Pact

A pact freezes:

- customer and provider wallets;
- service name and scope;
- period duration;
- fixed period bond;
- SLA clauses;
- minor / major / severe semantic tier rules;
- customer payout basis points for those tiers;
- 2-4 evidence sources with fixed role, URL and scope;
- immutable terms hash.

A pact can be `PROPOSED`, `ACTIVE`, `CANCELLED`, or `CLOSED`.

### Versioned policy and revision

The original policy is SLA version 1. Each version stores the complete semantic policy (service identity, service scope, clauses, tier meanings, evidence roles, URLs and scopes) under a pact/version key with a canonical SHA-256 digest. The pact stores bounded version identity metadata; each funded period copies its selected policy, version number and digest into its period record.

Either party may submit one bounded pending revision. It must use the exact revision schema and retain the same service identity, parties, period duration, bond, and payout basis points. Only the other party can approve, supplying the pact ID, proposal ID, base version and exact policy digest. Replacing, cancelling, or expiring a proposal leaves its old proposal ID unusable. Proposal validity is 24 hours; at most eight policy versions and 64 audit events are retained per pact.

Approval does not change the active policy or a funded period. At the next renewal, `fund_next_period` atomically binds an unexpired approved revision, appends the version record, sets that version active and funds the period. If approval has expired, the payable call reverts before consuming funds or approval. A pending but unapproved revision does not block renewal under the current version. Assessment, inconclusive retry, and expiry recovery read only the period's stored policy snapshot.

### Period

Every funded period has independent:

- index;
- funding/start/end timestamps;
- assessment-open time after a 5 minute evidence-maturity window;
- evidence deadline and last assessment time for a 5 minute retry cooldown;
- bond amount;
- assessment-attempt count;
- classification;
- evidence/assessment record;
- customer/provider credits;
- terminal timestamp.

Period status is `FUNDED`, `INCONCLUSIVE`, `SETTLED`, or `EXPIRED_UNRESOLVED`.

## Nondeterministic boundary

`assess_period` is the only core contract action that needs nondeterministic judgment.

For every source frozen in that period's bound version, validators fetch a bounded representation through GenLayer web access. The LLM must output one source finding per source, an exclusion status, a bounded timeline, an overall reason and one classification. The version number and digest are part of the normalized result.

Consequential findings must quote exact source substrings. Source bodies are not persisted in full; the assessment retains bounded provenance and hashes.

## Consensus boundary

The leader cannot simply declare a breach. Validators:

1. re-fetch the exact sources stored in the funded period's version snapshot;
2. independently run the period classifier using that version's clauses and tier meanings;
3. validate the leader result against their fetched source bodies;
4. compare consequential normalized material: classification, finding IDs/states/exact quotes/coverage, exclusion state/source/quote, event source/timing, full evidence provenance, period boundaries and immutable SLA version/digest. Narrative prose is retained for display but does not itself force disagreement.

## Deterministic boundary

After consensus, deterministic contract code maps classification to the frozen customer basis points:

- `NO_BREACH`: 0 customer bps;
- `MINOR`: frozen minor bps;
- `MAJOR`: frozen major bps;
- `SEVERE`: frozen severe bps;
- `INCONCLUSIVE`: no settlement.

The bond is converted to customer/provider pull credits. The model cannot create a new recipient, percentage or payout amount.

## Recurring loop

A terminal period does not end an active pact. The provider may fund the exact same frozen bond for the next period. That same atomic funding operation activates an approved, unexpired revision for the new period; otherwise the active version continues. Either party may instead close future renewal once the current period is terminal.

This makes the same bilateral agreement useful repeatedly while preserving the policy identity of each historical period.
