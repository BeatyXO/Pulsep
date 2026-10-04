# Pulsep submission draft

## Name
Pulsep

## Primary category
Infrastructure / service reliability (choose the closest Portal category available at submission time).

## One-liner
Recurring GenLayer reliability pacts that classify public SLA evidence through validator consensus and deterministically settle a pre-funded service bond.

## Description draft
Pulsep is a recurring SLA settlement protocol on GenLayer Studionet. A customer freezes the covered service, natural-language SLA clauses, breach-tier rules, public evidence sources, period duration, provider bond and deterministic payout percentages before a provider accepts. Each funded service period ends with validators independently retrieving the same pre-authorized provider and independent evidence, treating all web content as untrusted data, and independently classifying the period as NO_BREACH, MINOR, MAJOR, SEVERE or INCONCLUSIVE. The model cannot select recipients or amounts: frozen contract rules apply the agreed basis points. Missing or irreconcilable evidence stays INCONCLUSIVE for bounded reassessment instead of forcing a verdict. Once a period is terminal, the same pact can fund another period. Pulsep has no application backend or admin verdict override; canonical pact state and settlement accounting live in the Intelligent Contract.

## Links

- GitHub: https://github.com/BeatyXO/Pulsep
- Website: pending Vercel deployment
- Contract explorer: https://explorer-studio.genlayer.com/address/0x450d7D146B7F5041C7a4a0d0d70b65db1D58A43f
- Deployment transaction: https://explorer-studio.genlayer.com/tx/0x11b096c4245e6f8d816f62cd9396972d7c2c12b9e229a3a91f3b22d0717f0362
- Verification evidence: `public/verification.json` (partial; pact lifecycles remain outstanding)

Do not submit until Vercel deployment and the required pact lifecycle evidence are available.
