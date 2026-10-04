# Pulsep

**Recurring, evidence-bound reliability pacts on GenLayer.**

Pulsep lets a customer and service provider freeze an SLA, public evidence policy, period bond, breach tiers and deterministic settlement percentages before a service period starts. When the period ends, GenLayer validators independently fetch the exact pre-authorized public sources and classify the period as `NO_BREACH`, `MINOR`, `MAJOR`, `SEVERE`, or `INCONCLUSIVE`.

The model never selects payout amounts or recipients. Contract code applies the frozen basis points to the funded period bond.

## Why GenLayer is substantive here

A normal contract can compare numbers, but it cannot safely interpret conflicting public incident records, maintenance exclusions, natural-language SLA clauses and source availability. A centralized AI service could do that, but then the customer and provider would have to trust Pulsep's operator. Pulsep instead makes the judgment inside the Intelligent Contract and requires validator re-fetch/re-evaluation of the consequential classification.

The core path is:

`customer proposal -> provider acceptance + funded period -> public service evidence -> validator judgment -> deterministic settlement -> next period`

## Product shape

- **Frontend:** Next.js App Router + TypeScript.
- **Wallet:** injected EVM wallet such as MetaMask or Rabby.
- **Network:** stable GenLayer Studionet only, chain ID `61999`.
- **RPC:** `https://studio.genlayer.com/api`.
- **Intelligent Contracts:** one contract, `contracts/pulsep.py`.
- **Application backend:** none.
- **Canonical state:** contract reads.
- **External evidence:** fetched independently by validators from sources frozen in pact state.

## V1 lifecycle

1. The customer proposes a pact with a designated provider wallet.
2. Pact terms freeze the service scope, SLA clauses, three tier rules, customer payout basis points, period duration, bond and 2-4 HTTPS evidence sources.
3. At least one source must be provider-controlled and at least one independent.
4. The provider accepts by funding exactly the frozen period bond in simulated Studionet GEN.
5. The service period runs.
6. Assessment opens five minutes after period end so evidence can mature.
7. Validators independently retrieve the same frozen sources and independently classify the period.
8. Conclusive results settle the bond immediately in deterministic ledger credits.
9. `INCONCLUSIVE` keeps the bond locked and permits permissionless reassessment after a five-minute cooldown until the evidence deadline; there is no fixed retry cap.
10. If the evidence window expires unresolved, the bond returns to provider credit.
11. Once a period is terminal, the provider may fund the next period or either party may close future renewal.
12. Credits are withdrawn pull-style by the credited wallet.

## Classification and settlement

The contract recognizes only:

- `NO_BREACH`
- `MINOR`
- `MAJOR`
- `SEVERE`
- `INCONCLUSIVE`

`NO_BREACH` always returns the full period bond to the provider. The customer share for `MINOR`, `MAJOR`, and `SEVERE` is frozen in basis points at proposal time and must strictly increase. Whatever the model says about money is ignored because money fields are not part of the assessment schema.

## Evidence model

Each evidence source has a frozen:

- source ID;
- role (`PROVIDER`, `INDEPENDENT`, or optional `MAINTENANCE`);
- HTTPS URL;
- scope description.

During assessment the contract fetches each source through GenLayer web access. The page body is treated as untrusted data. Every consequential finding must include an exact substring from the fetched source. The stored assessment preserves bounded source provenance including availability, HTTP status, body SHA-256 and byte length.

`INDEPENDENT` is a role declared by the customer and accepted by the provider in frozen terms; Pulsep does not authenticate source ownership or certify objective independence. Available independent evidence is the agreed evidence anchor: provider-source unavailability alone cannot veto an independently supported breach. `NO_BREACH` requires an exact quoted coverage statement from independent evidence that covers the full period. Coverage is classified as `COVERS_PERIOD`, `STALE`, `PARTIAL`, `UNKNOWN`, or `UNAVAILABLE` and is consensus-bound. Missing or irreconcilable evidence can produce `INCONCLUSIVE`; uncertainty is never forced into a breach/no-breach answer.

## Consensus design

The leader fetches sources, runs the structured assessment and validates quotes/schema. Validators independently re-fetch all frozen sources and re-run the substantive classification. They compare the complete normalized assessment, including classification, reasons, exact quotes, coverage, exclusion reasoning, timeline, source provenance and period boundaries. Displayed assessment content is consensus-bound. Settlement remains deterministic contract code.
## Frontend safety

The frontend:

- refuses live signing until `public/deployment.json` is verified;
- enforces Studionet 61999 before signing;
- verifies active deployment policy before writes;
- optionally verifies deployed source SHA-256;
- stores a returned transaction hash immediately;
- blocks a second write while a known transaction is pending;
- treats Accepted/non-final receipts as pending;
- requires Finalized **and** successful contract execution before presenting success;
- reconstructs canonical pact state from contract reads.

Browser storage is only transaction-recovery convenience. It is never canonical pact state.

## Visual direction

Pulsep intentionally does not resemble the PatchBond workspace. It uses a dark observatory interface built from shades of grey, a Sora typeface, animated evidence-orbit background elements, service-period timelines and restrained hover glow on cards.

## Local frontend

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
```

The repository pins current stable frontend packages at the time of this handoff, including `next@16.3.8`, `react@19.3.0`, and `genlayer-js@1.1.8`.

## GenLayer CLI

The project intentionally pins repository-local `genlayer@0.39.1`. Do not substitute a globally installed RC/newer CLI for the deployment workflow.

```bash
pnpm install
pnpm genlayer -- --version
```

## Contract verification

```bash
python -m pip install -r requirements-test.txt
python scripts/preflight.py
python -m compileall contracts scripts tests
genvm-lint check contracts/pulsep.py
gltest -q
```

`python scripts/preflight.py --final` must remain red until a real deployment and evidence pack have replaced all deployment placeholders.

## Current status

Production frontend: [https://pulsep.vercel.app/](https://pulsep.vercel.app/). The root, pact creation, pact view, and activity routes are publicly reachable; anonymous reads load finalized contract state. The currently hosted deployment JSON points to the prior `pulsep.v0.1` contract and must not be used for signing after the `pulsep.v0.2` contract update. The frontend build and typecheck pass; The latest pre-fix GitHub Actions run passed, and this working tree passes updated local checks; the new commit run is pending. Pact-level settlement/withdrawal evidence remains outstanding. This browser had no injected wallet, and tablet/mobile viewport E2E has not been verified. Studionet GEN is simulated. See `BUILD_STATUS.md` and `DEPLOYMENT.md` for the remaining evidence.
