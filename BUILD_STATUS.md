# Pulsep build status

## Implemented in this handoff

- clean-room Pulsep product architecture;
- one recurring SLA Intelligent Contract;
- customer proposal / provider acceptance authorization;
- exact funded period bond;
- immutable service scope, SLA clauses, tier rules, payout basis points and source policy;
- required provider + independent evidence roles;
- bounded HTTPS evidence retrieval;
- hostile-source prompt boundary;
- exact-source quote validation;
- independent validator re-fetch and re-evaluation;
- consequence-key comparison rather than prose equality;
- deterministic settlement math;
- `INCONCLUSIVE` retained as nonterminal uncertainty;
- bounded reassessment;
- unresolved evidence expiry;
- recurring next-period funding;
- close-future-renewal path;
- pull-credit withdrawal accounting;
- Next.js App Router frontend;
- injected wallet connection and 61999 switching;
- verified-deployment gate;
- finalized execution-result interpretation;
- pending hash persistence and duplicate-send guard;
- grey observatory visual system, Sora typography, background motion and hover glow;
- contract/front-end CI structure;
- Direct Mode behavior suite and static invariant tests;
- preflight checks;
- architecture, security and verification documentation.

## Local verification completed in the current workspace

- `pnpm install` completed from the repository package configuration; the local CLI reports `genlayer 0.39.1`.
- `python scripts/preflight.py` and Python compile passed before generated build/test outputs were created.
- `gltest -q` passed **26 tests**: 21 Direct Mode cases and 5 source-invariant cases.
- Direct Mode now exercises all four conclusive classifications and bond conservation, malformed/fake/duplicate/omitted assessment findings, validator re-evaluation disagreement, model payout-field injection, inconclusive reassessment/expiry, recurring funding and withdrawal accounting.
- `genvm-lint check contracts/pulsep.py` passed static lint and SDK validation with `GENVM_VERSION=v0.2.16`, matching the stable runner used by Direct Mode. It extracted 14 methods (6 view, 8 write).
- Frontend typecheck passed; Vitest passed **8 tests**; the Next.js production build compiled and prerendered `/`, `/activity`, `/pacts/new` and `/pacts/view`.
- Stable Studionet deployment finalized successfully at `0x450d7D146B7F5041C7a4a0d0d70b65db1D58A43f`; deployment tx `0x11b096c4245e6f8d816f62cd9396972d7c2c12b9e229a3a91f3b22d0717f0362` reported successful execution and majority agreement.
- Deployed source read-back exactly matches the normalized-LF local contract hash `5a4784f9274bf12b68b3ff1d1b2b3906d473e72856a9641bda3a8a4d22f92bce`; schema has 14 methods; `get_config()` reports the required version, scope and null admin.
- `public/deployment.json` and `public/verification.json` now contain observed deployment evidence. The verification pack remains explicitly partial because pact lifecycles have not yet been run.

The preflight and source-invariant walkers now skip generated dependency/build/cache trees while scanning source. Preflight separately reports those generated directories so they can be removed before a clean handoff.

## Still not verified

- real public evidence lifecycle;
- settlement and outbound withdrawal transfer proof;
- browser wallet approval/rejection and known-hash refresh recovery;
- tablet/mobile viewport verification (the current browser test was desktop only);
- GenLayer Portal submission.

## Public frontend verification

- Canonical production URL: [https://pulsep.vercel.app/](https://pulsep.vercel.app/).
- Anonymous HTTP checks returned 200 for `/`, `/pacts/new/`, `/pacts/view/`, `/activity/`, `/deployment.json` and `/verification.json`.
- Browser checks rendered the home, pact creation, pact view and activity/recovery screens. Read-only pact listing completed without a wallet and returned an empty finalized list; no demo pact was presented as live state.
- The production `deployment.json` matches the tracked Studionet address, chain, version, source hash and deployment transaction. A direct read-only Studionet RPC check returned the expected `get_config()` policy and a deployed-source SHA-256 matching `contracts/pulsep.py`.
- A fresh production build and typecheck passed from source byte-identical to the checked-out `main` app. The served JS includes the source-hash guard, Studionet policy guard and duplicate-send protection.
- Desktop visual check passed at 1266×701. The source defines tablet/mobile reflow breakpoints at 980px and 680px, but those viewport sizes were not exercised in this browser session.
- Connect-wallet was attempted in the available browser; it reported no injected EVM wallet. Wallet approval/rejection and real transaction-hash refresh recovery remain unverified. The activity page rendered its empty recovery state.
- Canonical repository `main` verification baseline: `e20b096cbc4f63b6dace36a42add0c2dc670de14`; GitHub Actions run [37232009494](https://github.com/BeatyXO/Pulsep/actions/runs/37232009494) passed before these documentation updates.

Do not mark the remaining lifecycle and wallet items complete without actual evidence. Studionet GEN is simulated.
