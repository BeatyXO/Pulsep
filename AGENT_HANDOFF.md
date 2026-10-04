# Codex finishing handoff — Pulsep

Pulsep is already designed and substantially implemented. **Do not redesign the product.** Your job is runtime compatibility, hardening, real tests, stable Studionet deployment, live lifecycle proof, frontend deployment, evidence documentation and final cleanup.

Preserve these non-negotiables:

- repository: `BeatyXO/Pulsep`;
- product name: **Pulsep**;
- stable Studionet only, chain ID `61999`, RPC `https://studio.genlayer.com/api`;
- repository-local GenLayer CLI exactly `0.39.1`;
- one core Intelligent Contract unless a real runtime limitation forces a split;
- no application backend, database, cron worker, centralized AI adjudicator or operator outcome service;
- recurring pact periods, not one-shot claims;
- provider + independent evidence roles frozen before the period;
- validators fetch evidence themselves;
- independent validator re-evaluation, not leader-schema checking only;
- classifications: `NO_BREACH`, `MINOR`, `MAJOR`, `SEVERE`, `INCONCLUSIVE`;
- model never chooses payout amount or recipient;
- deterministic frozen basis-point settlement;
- `INCONCLUSIVE` must remain nonterminal with bounded reassessment;
- evidence expiry recovery must not fabricate a breach;
- no admin verdict override;
- frontend is mandatory and communicates directly with contract(s);
- injected MetaMask/Rabby-style wallet only;
- frontend must distinguish submitted / consensus / Accepted / Finalized / execution success;
- grey visual direction, Sora font, restrained motion, hover-glow cards;
- do not turn the UI into a PatchBond-style board or clone its information architecture.

Read `DEPLOYMENT.md` and `docs/VERIFICATION_PLAN.md` before changing code.
