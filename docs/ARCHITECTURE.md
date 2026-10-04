# Pulsep architecture

## System boundary

Pulsep is intentionally:

`USER -> NEXT.JS FRONTEND -> INJECTED WALLET -> GENLAYER INTELLIGENT CONTRACT -> VALIDATORS / PUBLIC WEB EVIDENCE -> CONTRACT STATE -> FRONTEND`

There is no application backend. The frontend can disappear without changing canonical pact state or settlement rights.

## Why one contract

V1 uses one Intelligent Contract because pact terms, funded periods, assessment state and settlement credits share one trust boundary. Splitting them would create cross-contract coordination without an independent authority or reuse need.

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

### Period

Every funded period has independent:

- index;
- funding/start/end timestamps;
- evidence deadline;
- bond amount;
- assessment-attempt count;
- classification;
- evidence/assessment record;
- customer/provider credits;
- terminal timestamp.

Period status is `FUNDED`, `INCONCLUSIVE`, `SETTLED`, or `EXPIRED_UNRESOLVED`.

## Nondeterministic boundary

`assess_period` is the only core V1 action that needs nondeterministic judgment.

For every frozen source, validators fetch a bounded representation through GenLayer web access. The LLM must output one source finding per source, an exclusion status, a bounded timeline, an overall reason and one classification.

Consequential findings must quote exact source substrings. Source bodies are not persisted in full; the assessment retains bounded provenance and hashes.

## Consensus boundary

The leader cannot simply declare a breach. Validators:

1. re-fetch all frozen sources;
2. independently run the period classifier;
3. validate the leader result against their fetched source bodies;
4. compare consequential classification, exclusion state, source finding states and source provenance hashes/statuses.

Reason wording is not an equivalence key.

## Deterministic boundary

After consensus, deterministic contract code maps classification to the frozen customer basis points:

- `NO_BREACH`: 0 customer bps;
- `MINOR`: frozen minor bps;
- `MAJOR`: frozen major bps;
- `SEVERE`: frozen severe bps;
- `INCONCLUSIVE`: no settlement.

The bond is converted to customer/provider pull credits. The model cannot create a new recipient, percentage or payout amount.

## Recurring loop

A terminal period does not end an active pact. The provider may fund the exact same frozen bond for the next period. Either party may instead close future renewal once the current period is terminal.

This makes the same bilateral agreement useful repeatedly without mutating the evidence policy or SLA during a period.
