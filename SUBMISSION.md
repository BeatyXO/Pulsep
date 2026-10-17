# Pulsep submission draft

## Name
Pulsep

## Primary category
Infrastructure / service reliability (choose the closest Portal category available at submission time).

## One-liner
Recurring GenLayer reliability pacts that judge public SLA evidence through validator re-fetch and independent re-evaluation, then deterministically settle a frozen period bond.

## Description draft
Pulsep is a recurring SLA reliability protocol on GenLayer Studionet. A customer freezes the covered service, SLA clauses, breach-tier rules, public evidence policy, period duration, provider bond and payout percentages before provider acceptance. After a post-period evidence-maturity window, validators independently retrieve the agreed sources and determine NO_BREACH, MINOR, MAJOR, SEVERE or INCONCLUSIVE. INDEPENDENT is a customer-declared role accepted by the provider, not externally authenticated ownership. Provider-source unavailability alone cannot veto an independently supported breach. NO_BREACH requires explicit quoted independent coverage of the entire period. Validators compare the full normalized explanation and evidence record; the model cannot choose recipients or amounts. Frozen contract basis points determine settlement. INCONCLUSIVE keeps the bond locked for cooldown-limited reassessment until the evidence deadline, after which unresolved recovery follows deterministic contract rules. The same pact can fund another period after terminal settlement.

## Links

- GitHub: https://github.com/BeatyXO/Pulsep
- Website: https://pulsep.vercel.app/
- Contract explorer: https://explorer-studio.genlayer.com/address/0xfaA7FADDEcb4EDe3Bd46001bDf812076b953067A
- Deployment transaction: https://explorer-studio.genlayer.com/tx/0x768d607db626ceffc04290e446a756044c215b090d8fb316e0a948a96a77f7a2
- Verification evidence: `public/verification.json` (source verified; one NO_BREACH lifecycle and withdrawal finalized; broader lifecycle proof remains incomplete)

Studionet GEN is simulated. Pulsep is not described as audited, production-safe, real-money settlement or legally binding arbitration.

## Versioned SLA Renewals milestone submission (provisional until live evidence is complete)

**Milestone title:** Versioned SLA Renewals

**Milestone description (copy-ready, under 1,000 characters):** Pulsep adds mutually approved, versioned SLA renewals to its recurring GenLayer settlement pact. Either party can propose future service-scope, SLA-clause, tier-rule, or evidence-source changes; only the designated counterparty can approve the exact proposal ID, base version, and canonical policy digest before its 24-hour expiry. Approval does not alter a funded period. The next renewal atomically activates the approved policy and binds its full snapshot and digest to the new period. Historical periods, evidence URLs, bond, parties, and deterministic payout basis points remain fixed. Validators assess each period using its original version-specific evidence and terms.

**Baseline:** pre-milestone HEAD `fc667a11fcc467b99cdd7d68bf5bb745445b620d`. Official accepted submission SHA remains unverified; this is not labeled an accepted baseline.

**Comparison URL:** provisional until final milestone commit exists: `https://github.com/BeatyXO/Pulsep/compare/fc667a11fcc467b99cdd7d68bf5bb745445b620d...FINAL_SHA`

**Milestone contract / explorer / deployment receipt:** pending deployment and read-back verification.

**Live URL:** https://pulsep.vercel.app/ (v0.4 production binding pending verification).

**Evidence:** `MILESTONE_EVIDENCE.md`, `public/versioned-renewal-verification.json`; two-period Studionet receipts, final CI link, and v0.4 deployment manifest will be filled only after observed.
