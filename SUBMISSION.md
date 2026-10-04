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
- Contract explorer: https://explorer-studio.genlayer.com/address/0x99b88F9724182Fa6e4C5A7a8e936AcAeA5872A82
- Deployment transaction: https://explorer-studio.genlayer.com/tx/0x43eb394bbbdd5842450e73e85d5cb10dc4d056ce004a8c3905ed4739a0c3fe35
- Verification evidence: `public/verification.json` (deployment verified; live lifecycle proof remains incomplete)

Studionet GEN is simulated. Pulsep is not described as audited, production-safe, real-money settlement or legally binding arbitration.
