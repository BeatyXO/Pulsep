# Pulsep build status

## Verified implementation and deployment

- Pulsep is a recurring SLA Intelligent Contract plus a direct-wallet Next.js frontend; there is no application adjudication backend or admin verdict path.
- Contract hardening makes available independent evidence the agreed evidence anchor, requires exact independent covered-period evidence for `NO_BREACH`, and requires independent breach support for MINOR/MAJOR/SEVERE.
- Coverage/freshness, full-period maturity, exact quote grounding, and affirmative evidence for applied provider/maintenance exclusions are enforced and included in validator comparison.
- `INCONCLUSIVE` preserves locked bond value and permits reassessment after a deterministic 300-second cooldown until the frozen evidence deadline.
- Current contract version `pulsep.v0.2` was deployed to stable Studionet 61999. Finalized transaction: `0x43eb394bbbdd5842450e73e85d5cb10dc4d056ce004a8c3905ed4739a0c3fe35`; address: `0x99b88F9724182Fa6e4C5A7a8e936AcAeA5872A82`.
- Deployed source was read back and its normalized-LF SHA-256 matched tracked source `0a3c89de6f92ddb34832aaee53119a75d8293d98a04a3d006b4203a6e89902b1`.
- On-chain config reads `version=pulsep.v0.2`, `network_scope=studionet-only`, `admin=null`, `assessment_cooldown_seconds=300`, and `evidence_maturity_seconds=300`; schema has 14 methods (6 views, 8 writes).
- `public/deployment.json` is source-verified and enables signing only after frontend chain/config/source guards pass.
- Synthetic, explicitly labeled public evidence files are included under `public/evidence/`; immutable fixtures are referenced by commit-pinned raw GitHub URLs in the machine-readable verification pack.

## Verification results

- Repository-local CLI: `genlayer@0.39.1`.
- `pnpm install --frozen-lockfile`: PASS.
- Typecheck: PASS.
- Vitest: 8/8 PASS.
- Next.js production build: PASS.
- Python compile: PASS.
- GenVM static lint and SDK semantic validation with stable GenVM `v0.2.16`: PASS.
- Direct Mode: 28/28 PASS.
- GitHub Actions on source commit `ebcec3542349af107c2d8b821750369413d6c520`: PASS, run [37243624520](https://github.com/BeatyXO/Pulsep/actions/runs/37243624520).

## Still outstanding

- Publish and verify the frontend deployment using the new `public/deployment.json`, then check anonymous `/`, `/pacts/new/`, `/pacts/view/`, `/activity/`, and responsive desktop/tablet/mobile behavior.
- Complete real Studionet lifecycle evidence: NO_BREACH settlement/withdrawal, MAJOR split/withdrawal, provider-source unavailable with independent breach, late-notice exclusion rejection, valid maintenance exclusion, INCONCLUSIVE lock, subsequent recovery/reassessment or expiry, and a funded second period.
- Record actual finalized negative transition receipts and reconcile ledger/recipient balance changes and outbound transfers.
- Verify injected-wallet approval/rejection and hash recovery only if a real wallet is available.

Studionet GEN is simulated. Pulsep has not been independently audited and is not presented as bug-free, production-safe, real-money settlement, or legally binding arbitration.
