# Pulsep verification plan

The target is evidence quality, not a vanity test count.

## 1. Static/preflight

- source parses;
- exact py-genlayer dependency pin present;
- repo-local CLI is `genlayer@0.39.1`;
- no preview-network drift;
- no secrets/generated account material;
- required docs/tests/frontend files present;
- final mode fails while deployment evidence is incomplete.

## 2. Direct Mode

Direct Mode currently covers:

- proposal term freezing, source URL policy, designated-provider authorization and exact bond;
- period-end and evidence-maturity rejection; NO_BREACH full-period independent coverage; MINOR / MAJOR / SEVERE deterministic outcomes;
- payout-field injection has no authority, and customer/provider credits conserve the bond;
- provider evidence outage cannot veto an independent breach; independent role semantics; coverage/freshness states; INCONCLUSIVE lock, cooldown-limited uncapped retries and unresolved expiry;
- malformed classification, unknown finding state, fake quote, omitted finding and duplicate finding rejection;
- validator disagreement across classification and displayed reasoning, payout-field injection, recurring period gate, close gate and withdrawal accounting.

Latest local run before final commit: `gltest -q` passed 28 behavior/source-invariant tests. It is local simulation evidence only, not Studionet evidence or outbound-transfer proof.

Codex must run these against the pinned environment, fix only real compatibility defects, and add cases where evidence/model output is malformed, duplicated, omitted or adversarial.

## 3. Frontend

Current unit tests cover high-risk pure behavior: precise amount handling and finalized receipt interpretation. Codex should add:

- deployment mismatch;
- wrong-network path;
- account change;
- user rejection;
- one-send guard;
- missing/malformed returned hash;
- page refresh with pending hash;
- successful finalized receipt;
- finalized execution error;
- contract role-state gating.

## 4. Live Studionet

Use disposable wallets and public, intentionally controlled evidence fixtures. Evidence must be genuinely fetched by GenLayer validators. Do not fake a status source inside the frontend.

Required live stories:

### A. No breach
Both sources support healthy service; provider receives full credit.

### B. Major breach
Provider and independent source show an outage satisfying the frozen major rule; exact frozen split is credited.

### C. Exclusion reasoning
Evidence shows a downtime-looking event plus a maintenance notice. Design one case where the notice genuinely qualifies or deliberately postdates the incident, proving the contract reasons over the frozen exclusion instead of trusting a label.

### D. Inconclusive
Make one frozen source return unavailable/contradictory evidence. The result must not settle funds.

### E. Reassessment or expiry
Restore reliable evidence before the deadline and reach a conclusion, or let the evidence deadline expire and prove provider recovery.

### F. Recurrence
Fund period 2 on the exact same pact after period 1 is terminal.

## 5. Live negative transactions

Submit finalized expected failures for role, amount, timing, duplicate/invalid lifecycle and empty withdrawal. Mark expected execution errors clearly as tests that passed because the contract rejected them.

## 6. Accounting

Publish machine-readable evidence containing every relevant tx hash, validator vote summary, classification, source digest, ledger snapshot and outbound transfer receipt. Recompute the accounting totals independently in a checker script.

## 7. Browser wallet

After the public frontend is deployed, use a real injected wallet with the owner approving/rejecting prompts. Prove one successful signed action and one clean rejection path without automatic resubmission.
