# Pulsep security and trust model

Pulsep is a Studionet prototype, not a security-audited or real-money production SLA product.

## Trust assumptions

### Public source truth

Validator consensus cannot turn a dishonest webpage into ground truth. V1 mitigates this by requiring both provider-controlled and independent sources, freezing them before the period, and permitting `INCONCLUSIVE` rather than forcing a result.

### Source mutability

Public pages can change between validators or disappear. That can prevent consensus or produce `INCONCLUSIVE`. This is safer than silently accepting stale or single-party evidence.

### SLA quality

Pulsep does not guarantee that parties wrote a commercially sensible SLA. The UI encourages measurable scope and tier definitions, but parties are responsible for the pact they accept.

### Generic HTTPS

V1 allows bounded public HTTPS sources instead of a hardcoded vendor list. This improves product reach but means Codex must specifically test GenVM URL/web behavior, redirects, content-type handling and dynamically rendered pages before live submission.

## Prompt-injection boundary

Every source body, SLA clause, HTML comment and metadata field is explicitly labeled untrusted data. The prompt forbids following instructions contained in evidence. Consequential findings also require source-grounded exact quotes.

Prompt hardening is not enough by itself; independent validators refetch and rerun the classification.

## Settlement authority

The model can output only a standardized classification and evidence interpretation. Amounts and recipients are not model fields. Contract code uses frozen basis points and the customer/provider addresses already stored in pact state.

## Wallet safety

The frontend:

- verifies chain 61999;
- verifies the configured deployment policy;
- optionally hashes deployed source;
- remembers a transaction hash as soon as the wallet returns one;
- blocks duplicate wallet send attempts for one explicit action;
- does not report success from an Accepted-but-not-finalized transaction;
- treats finalized execution errors as failures.

A wallet rejection is not evidence that no unknown transaction exists if a wallet request had already been sent and no hash was returned. The UI tells the user to inspect wallet activity/explorer before retrying.

## No admin override

`get_config()` reports `admin: None`. There is no write path for an operator to replace a consensus classification or redirect settlement.

## Outbound transfer limitation

Withdrawal uses a finalized outbound EVM transfer message. Local/direct tests can prove ledger consumption and message creation; live verification must separately prove the resulting transfer transaction/finalization.
