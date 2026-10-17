"""Behavioral Direct Mode tests for Pulsep."""
import json
import pytest
pytest.importorskip("gltest", reason="genlayer-test is required for Direct Mode")
from conftest import NOW, addr, iso

CONTRACT = "contracts/pulsep.py"
PACT = "PULSE-TEST-001"
PROVIDER_URL = "https://status.example.com/incidents"
INDEPENDENT_URL = "https://monitor.example.com/history"
PROVIDER_PAGE = "Coverage 2033-05-18T03:00:00Z to 2033-05-18T05:00:00Z. Incident opened 2033-05-18T03:35:00Z. Production API unavailable. Service restored 2033-05-18T04:22:00Z."
INDEPENDENT_PAGE = "Coverage 2033-05-18T03:00:00Z to 2033-05-18T05:00:00Z. Monitor detected Production API unavailable from 2033-05-18T03:33:00Z until 2033-05-18T04:23:00Z."


def terms(provider):
    return {
        "id": PACT,
        "title": "Production API reliability pact",
        "service": "Example Production API",
        "service_scope": "The public production API endpoint and its normal request path.",
        "provider": addr(provider),
        "period_seconds": 900,
        "bond_wei": str(10**16),
        "sla_clauses": [
            "The covered production API should remain available throughout the funded period.",
            "Planned maintenance is excluded only when publicly announced before the affected incident begins."
        ],
        "tier_rules": {
            "minor": "A material degradation shorter than 30 minutes.",
            "major": "A qualifying outage lasting at least 30 minutes but less than 60 minutes.",
            "severe": "A qualifying outage lasting 60 minutes or more."
        },
        "customer_bps": {"minor": 2000, "major": 6000, "severe": 10000},
        "sources": [
            {"id": "provider_status", "role": "PROVIDER", "url": PROVIDER_URL, "scope": "Provider incident history for the covered service."},
            {"id": "independent_monitor", "role": "INDEPENDENT", "url": INDEPENDENT_URL, "scope": "Independent uptime history for the covered service."}
        ]
    }


def result(classification="MAJOR"):
    return {
        "classification": classification,
        "source_findings": [
            {"id": "provider_status", "state": "BREACH" if classification != "NO_BREACH" else "NO_BREACH", "reason": "Provider record covers the incident.", "quote": "Production API unavailable", "coverage":"COVERS_PERIOD", "coverage_quote":"Coverage 2033-05-18T03:00:00Z to 2033-05-18T05:00:00Z"},
            {"id": "independent_monitor", "state": "BREACH" if classification != "NO_BREACH" else "NO_BREACH", "reason": "Independent monitor confirms the same service impact.", "quote": "Production API unavailable", "coverage":"COVERS_PERIOD", "coverage_quote":"Coverage 2033-05-18T03:00:00Z to 2033-05-18T05:00:00Z"}
        ],
        "exclusion": {"status": "NOT_RELEVANT", "reason": "No qualifying maintenance exclusion is evidenced."},
        "timeline": [
            {"at": "2033-05-18T03:33:00Z", "source_id": "independent_monitor", "event": "Independent monitor detects the outage."},
            {"at": "2033-05-18T04:22:00Z", "source_id": "provider_status", "event": "Provider reports restoration."}
        ],
        "reason": "Both frozen sources support a qualifying outage in the major tier."
    }


def inconclusive_result():
    return {
        "classification": "INCONCLUSIVE",
        "source_findings": [
            {"id": "provider_status", "state": "UNAVAILABLE", "reason": "Provider source could not be retrieved.", "quote": "", "coverage":"UNAVAILABLE", "coverage_quote":""},
            {"id": "independent_monitor", "state": "BREACH", "reason": "Independent monitor shows an outage but role coverage is incomplete.", "quote": "Production API unavailable", "coverage":"COVERS_PERIOD", "coverage_quote":"Coverage 2033-05-18T03:00:00Z to 2033-05-18T05:00:00Z"}
        ],
        "exclusion": {"status": "UNCLEAR", "reason": "Provider evidence is unavailable."},
        "timeline": [{"at": "2033-05-18T03:33:00Z", "source_id": "independent_monitor", "event": "Independent monitor detects outage."}],
        "reason": "The required provider-controlled evidence is unavailable, so a conclusive tier is not justified."
    }


def deploy(direct_vm, direct_deploy):
    direct_vm.check_pickling = True
    return direct_deploy(CONTRACT, sdk_version="v0.2.16")


def mock_evidence(vm, provider_status=200, provider_body=PROVIDER_PAGE, independent_status=200, independent_body=INDEPENDENT_PAGE, llm=None):
    vm.clear_mocks()
    vm.mock_web(r"status\.example\.com/incidents", {"status": provider_status, "body": provider_body})
    vm.mock_web(r"monitor\.example\.com/history", {"status": independent_status, "body": independent_body})
    vm.mock_llm(r"PULSEP_SLA_PERIOD_V2", json.dumps(llm or result()))


def mock_revision_evidence(vm, provider_status=200, provider_body=PROVIDER_PAGE, independent_status=200, independent_body=INDEPENDENT_PAGE, llm=None):
    vm.clear_mocks()
    vm.mock_web(r"status\.example\.com/incidents-v2", {"status": provider_status, "body": provider_body})
    vm.mock_web(r"monitor\.example\.com/history-v2", {"status": independent_status, "body": independent_body})
    vm.mock_llm(r"PULSEP_SLA_PERIOD_V2", json.dumps(llm or result()))


def create(direct_vm, direct_deploy, customer, provider):
    c = deploy(direct_vm, direct_deploy)
    direct_vm.sender = customer
    c.propose_pact(json.dumps(terms(provider)))
    return c


def activate(direct_vm, c, provider):
    direct_vm.sender = provider
    direct_vm.deal(provider, 10**18)
    direct_vm.value = 10**16
    c.accept_and_fund(PACT)
    direct_vm.value = 0


def test_proposal_freezes_terms_and_has_no_funds(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob)
    pact = c.get_pact(PACT)
    assert pact["status"] == "PROPOSED"
    assert pact["customer"] == addr(direct_alice)
    assert pact["provider"] == addr(direct_bob)
    assert len(pact["terms_hash"]) == 64
    assert c.get_accounting(addr(direct_alice))["deposited"] == "0"


def test_private_or_duplicate_source_configuration_fails(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice
    bad = terms(direct_bob)
    bad["id"] = "PULSE-BAD-001"
    bad["sources"][1]["url"] = "https://127.0.0.1/history"
    with direct_vm.expect_revert("Private/local"):
        c.propose_pact(json.dumps(bad))
    dup = terms(direct_bob)
    dup["id"] = "PULSE-BAD-002"
    dup["sources"][1]["url"] = dup["sources"][0]["url"]
    with direct_vm.expect_revert("Duplicate evidence source URL"):
        c.propose_pact(json.dumps(dup))


def test_only_provider_can_accept_and_exact_bond_is_required(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob)
    direct_vm.sender = direct_charlie
    direct_vm.deal(direct_charlie, 10**18)
    direct_vm.value = 10**16
    with direct_vm.expect_revert("designated provider"):
        c.accept_and_fund(PACT)
    direct_vm.sender = direct_bob
    direct_vm.deal(direct_bob, 10**18)
    direct_vm.value = 10**15
    with direct_vm.expect_revert("Fund exactly"):
        c.accept_and_fund(PACT)
    direct_vm.value = 10**16
    c.accept_and_fund(PACT)
    direct_vm.value = 0
    assert c.get_pact(PACT)["status"] == "ACTIVE"
    assert c.get_current_period(PACT)["status"] == "FUNDED"


def test_assessment_cannot_happen_before_period_end(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 901))
    mock_evidence(direct_vm)
    with direct_vm.expect_revert("maturity window"):
        c.assess_period(PACT, 1)


def test_major_breach_deterministically_splits_bond(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm, llm=result("MAJOR"))
    c.assess_period(PACT, 1)
    assert direct_vm.run_validator() is True
    period = c.get_period(PACT, 1)
    assert period["status"] == "SETTLED" and period["classification"] == "MAJOR"
    assert period["customer_credit"] == str(6 * 10**15)
    assert period["provider_credit"] == str(4 * 10**15)
    assert c.get_accounting(addr(direct_alice))["claimable"] == str(6 * 10**15)
    assert c.get_accounting(addr(direct_bob))["claimable"] == str(4 * 10**15)


@pytest.mark.parametrize(
    ("classification", "customer_amount"),
    [("NO_BREACH", 0), ("MINOR", 2 * 10**15), ("SEVERE", 10**16)],
)
def test_remaining_conclusive_tiers_use_frozen_split_and_conserve_bond(
    direct_vm, direct_deploy, direct_alice, direct_bob, classification, customer_amount
):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm, llm=result(classification))
    c.assess_period(PACT, 1)
    period = c.get_period(PACT, 1)
    customer_credit = int(period["customer_credit"])
    provider_credit = int(period["provider_credit"])
    assert customer_credit == customer_amount
    assert customer_credit + provider_credit == 10**16
    assert period["classification"] == classification


def test_no_breach_requires_independent_covered_period_evidence(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201))
    raw = result("NO_BREACH")
    raw["source_findings"][1]["coverage"] = "STALE"
    mock_evidence(direct_vm, llm=raw)
    with direct_vm.expect_revert("NO_BREACH requires"):
        c.assess_period(PACT, 1)


@pytest.mark.parametrize(
    ("mutation", "error"),
    [
        ("fake_quote", "not present"),
        ("omit_finding", "One source finding"),
        ("duplicate_finding", "IDs must match"),
        ("unknown_classification", "Unsupported classification"),
        ("unknown_state", "Unsupported source finding state"),
    ],
)
def test_malformed_assessment_fails_closed(direct_vm, direct_deploy, direct_alice, direct_bob, mutation, error):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201))
    raw = result("MAJOR")
    if mutation == "fake_quote":
        raw["source_findings"][0]["quote"] = "invented outage quote"
    elif mutation == "omit_finding":
        raw["source_findings"].pop()
    elif mutation == "duplicate_finding":
        raw["source_findings"][1] = dict(raw["source_findings"][0])
    elif mutation == "unknown_classification":
        raw["classification"] = "EXTREME"
    else:
        raw["source_findings"][0]["state"] = "MAYBE"
    mock_evidence(direct_vm, llm=raw)
    with direct_vm.expect_revert(error):
        c.assess_period(PACT, 1)
    assert c.get_accounting(addr(direct_bob))["locked"] == str(10**16)


def test_validator_re_evaluation_rejects_a_different_classification(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm, llm=result("MAJOR"))
    c.assess_period(PACT, 1)
    # The captured validator reruns the full source evaluation. A different
    # substantive classification must fail its consequence-key comparison.
    mock_evidence(direct_vm, llm=result("MINOR"))
    assert direct_vm.run_validator() is False


def test_validator_comparison_ignores_narrative_but_binds_exact_source_quotes(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm, llm=result("MAJOR"))
    c.assess_period(PACT, 1)
    changed = result("MAJOR")
    changed["reason"] = "Different overall explanation"
    changed["source_findings"][0]["reason"] = "Different source explanation"
    changed["exclusion"]["reason"] = "Different exclusion explanation"
    changed["timeline"][0]["event"] = "Different event wording"
    mock_evidence(direct_vm, llm=changed)
    assert direct_vm.run_validator() is True
    changed = result("MAJOR"); changed["source_findings"][1]["quote"] = "A different quote present in the source"
    mock_evidence(direct_vm, llm=changed)
    assert direct_vm.run_validator() is False


def test_model_cannot_choose_amount_or_recipient(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201))
    raw = result("MINOR"); raw["customer_bps"] = 9999; raw["recipient"] = addr(direct_bob)
    mock_evidence(direct_vm, llm=raw)
    c.assess_period(PACT, 1)
    period = c.get_period(PACT, 1)
    assert period["customer_credit"] == str(2 * 10**15)
    assert period["provider_credit"] == str(8 * 10**15)


def test_provider_source_failure_cannot_veto_independent_major_evidence(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201))
    raw = result("MAJOR")
    raw["source_findings"][0] = {"id":"provider_status","state":"UNAVAILABLE","reason":"source unavailable","quote":"", "coverage":"UNAVAILABLE", "coverage_quote":""}
    mock_evidence(direct_vm, provider_status=503, provider_body="", llm=raw)
    c.assess_period(PACT, 1)
    assert c.get_period(PACT, 1)["classification"] == "MAJOR"


def test_inconclusive_keeps_bond_locked_and_cooldown_allows_later_resolution(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm, provider_status=503, provider_body="", llm=inconclusive_result())
    c.assess_period(PACT, 1)
    p = c.get_period(PACT, 1)
    assert p["status"] == "INCONCLUSIVE" and p["assessment_attempts"] == 1
    assert c.get_accounting(addr(direct_bob))["locked"] == str(10**16)
    mock_evidence(direct_vm, llm=inconclusive_result())
    with direct_vm.expect_revert("cooldown"):
        c.assess_period(PACT, 1)
    direct_vm.warp(iso(NOW + 1502)); mock_evidence(direct_vm, provider_status=503, provider_body="", llm=inconclusive_result()); c.assess_period(PACT, 1)
    assert c.get_period(PACT, 1)["assessment_attempts"] == 2
    direct_vm.warp(iso(NOW + 1803)); mock_evidence(direct_vm, llm=result("MAJOR")); c.assess_period(PACT, 1)
    assert c.get_period(PACT, 1)["status"] == "SETTLED"
    assert c.get_period(PACT, 1)["assessment_attempts"] == 3
    with direct_vm.expect_revert("cannot be assessed"):
        c.assess_period(PACT, 1)


def test_unresolved_expiry_returns_bond_to_provider(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 900 + 7*24*60*60))
    c.expire_unresolved(PACT, 1)
    p = c.get_period(PACT, 1)
    assert p["status"] == "EXPIRED_UNRESOLVED"
    assert c.get_accounting(addr(direct_bob))["claimable"] == str(10**16)


def test_recurring_period_requires_previous_terminal_state(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.sender = direct_bob; direct_vm.value = 10**16
    with direct_vm.expect_revert("terminal state"):
        c.fund_next_period(PACT)
    direct_vm.value = 0
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm); c.assess_period(PACT,1)
    direct_vm.sender = direct_bob; direct_vm.value = 10**16; c.fund_next_period(PACT); direct_vm.value = 0
    assert c.get_pact(PACT)["period_count"] == 2
    assert c.get_period(PACT,2)["status"] == "FUNDED"


def test_pact_cannot_close_with_active_funded_period(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("must finish"):
        c.close_pact(PACT)
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm); c.assess_period(PACT,1); c.close_pact(PACT)
    assert c.get_pact(PACT)["status"] == "CLOSED"


def test_withdraw_consumes_credit_once(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm); c.assess_period(PACT,1)
    direct_vm.sender = direct_alice
    # The current Direct Mode API does not expose captured messages; assert
    # the observable credit consumption and transfer accounting instead.
    c.withdraw()
    assert c.get_accounting(addr(direct_alice))["claimable"] == "0"
    assert c.get_accounting(addr(direct_alice))["withdrawn"] == str(6 * 10**15)
    assert c.get_accounting(addr(direct_bob))["credited"] == str(4 * 10**15)
    with direct_vm.expect_revert("No claimable credit"):
        c.withdraw()


def revision_terms():
    return {
        "service_scope": "The same public production API endpoint, with revised latency and availability policy.",
        "sla_clauses": ["Monthly uptime must be at least 99.95%.", "Maintenance is excluded only with 24 hours advance notice."],
        "tier_rules": {
            "minor": "A qualifying availability shortfall of up to 0.05 percentage points.",
            "major": "A qualifying availability shortfall above 0.05 and up to 0.5 percentage points.",
            "severe": "A qualifying availability shortfall above 0.5 percentage points."
        },
        "sources": [
            {"id": "provider_status", "role": "PROVIDER", "url": "https://status.example.com/incidents-v2", "scope": "Provider records under revision two."},
            {"id": "independent_monitor", "role": "INDEPENDENT", "url": "https://monitor.example.com/history-v2", "scope": "Independent monthly coverage under revision two."}
        ]
    }


def propose_revision(direct_vm, c, customer, revision=None):
    direct_vm.sender = customer
    c.propose_revision(PACT, json.dumps(revision or revision_terms()))
    return c.get_pact(PACT)["pending_revision"]


def test_revision_counterparty_digest_binding_and_future_period_activation(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    pending = propose_revision(direct_vm, c, direct_alice)
    assert pending["base_version"] == 1 and pending["next_version"] == 2
    assert pending["status"] == "PENDING"
    assert c.get_period(PACT, 1)["sla_version"] == 1
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("designated counterparty"):
        c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Unknown pact"):
        c.approve_revision("PULSE-OTHER-001", pending["proposal_id"], pending["base_version"], pending["digest"])
    with direct_vm.expect_revert("digest mismatch"):
        c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], "0" * 64)
    with direct_vm.expect_revert("base version mismatch"):
        c.approve_revision(PACT, pending["proposal_id"], 2, pending["digest"])
    c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])
    with direct_vm.expect_revert("terminal state"):
        c.fund_next_period(PACT)
    assert c.get_period(PACT, 1)["policy"]["sla_clauses"] == terms(direct_bob)["sla_clauses"]
    assert c.get_pact(PACT)["active_sla_version"] == 1

    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm); c.assess_period(PACT, 1)
    direct_vm.sender = direct_bob; direct_vm.value = 10**16; c.fund_next_period(PACT); direct_vm.value = 0
    period2 = c.get_period(PACT, 2)
    pact = c.get_pact(PACT)
    assert pact["active_sla_version"] == 2
    assert period2["sla_version"] == 2
    assert period2["terms_digest"] == pending["digest"]
    assert period2["policy"]["sources"][0]["url"].endswith("incidents-v2")
    assert c.get_period(PACT, 1)["sla_version"] == 1
    assert [v["version"] for v in c.get_sla_versions(PACT)] == [1, 2]
    history = c.get_revision_history(PACT)
    assert [row["event"] for row in history] == ["PROPOSED", "APPROVED", "ACTIVATED"]

    direct_vm.warp(iso(NOW + 2402))
    direct_vm.clear_mocks()
    direct_vm.mock_web(r"status\.example\.com/incidents-v2", {"status": 200, "body": PROVIDER_PAGE})
    direct_vm.mock_web(r"monitor\.example\.com/history-v2", {"status": 200, "body": INDEPENDENT_PAGE})
    direct_vm.mock_llm(r"PULSEP_SLA_PERIOD_V2", json.dumps(result("MINOR")))
    c.assess_period(PACT, 2)
    assert direct_vm.run_validator() is True
    period2 = c.get_period(PACT, 2)
    assert period2["assessment"]["sla_version"] == 2
    assert period2["assessment"]["terms_digest"] == pending["digest"]
    assert period2["classification"] == "MINOR"
    assert period2["bond"] == "10000000000000000"
    assert c.get_pact(PACT)["customer_bps"] == terms(direct_bob)["customer_bps"]
    assert c.get_period(PACT, 1)["assessment"]["sla_version"] == 1


def test_inconclusive_reassessment_keeps_the_period_bound_to_its_original_revision(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    pending = propose_revision(direct_vm, c, direct_alice)
    direct_vm.sender = direct_bob; c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm); c.assess_period(PACT, 1)
    direct_vm.sender = direct_bob; direct_vm.value = 10**16; c.fund_next_period(PACT); direct_vm.value = 0
    period = c.get_period(PACT, 2)
    assert period["sla_version"] == 2 and period["terms_digest"] == pending["digest"]
    direct_vm.warp(iso(NOW + 2402))
    mock_revision_evidence(direct_vm, provider_status=503, provider_body="", llm=inconclusive_result())
    c.assess_period(PACT, 2)
    period = c.get_period(PACT, 2)
    assert period["status"] == "INCONCLUSIVE"
    assert period["sla_version"] == 2 and period["assessment"]["terms_digest"] == pending["digest"]
    assert c.get_accounting(addr(direct_bob))["locked"] == str(10**16)
    direct_vm.warp(iso(NOW + 2703)); mock_revision_evidence(direct_vm, llm=result("MAJOR"))
    c.assess_period(PACT, 2)
    period = c.get_period(PACT, 2)
    assert period["status"] == "SETTLED" and period["assessment_attempts"] == 2
    assert period["sla_version"] == 2 and period["assessment"]["terms_digest"] == pending["digest"]


def test_provider_may_propose_customer_approves_and_supersession_replay_fails(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    first = propose_revision(direct_vm, c, direct_bob)
    updated = revision_terms(); updated["service_scope"] = "Provider-revised future scope with explicit endpoint coverage."
    second = propose_revision(direct_vm, c, direct_bob, updated)
    assert second["proposal_id"] != first["proposal_id"]
    assert [row["event"] for row in c.get_revision_history(PACT)] == ["PROPOSED", "SUPERSEDED", "PROPOSED"]
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("proposal ID mismatch"):
        c.approve_revision(PACT, first["proposal_id"], first["base_version"], first["digest"])
    c.approve_revision(PACT, second["proposal_id"], second["base_version"], second["digest"])
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("No pending revision"):
        c.approve_revision(PACT, second["proposal_id"], second["base_version"], second["digest"])


def test_revision_validation_cancel_expiry_and_history_pagination(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("Only a pact party"):
        c.propose_revision(PACT, json.dumps(revision_terms()))
    bad = revision_terms(); bad["sources"][1]["role"] = "PROVIDER"
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("requires provider and independent"):
        c.propose_revision(PACT, json.dumps(bad))
    pending = propose_revision(direct_vm, c, direct_alice)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("designated counterparty"):
        c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the proposer"):
        c.cancel_revision(PACT, pending["proposal_id"])
    direct_vm.sender = direct_alice
    c.cancel_revision(PACT, pending["proposal_id"])
    with direct_vm.expect_revert("No pending revision"):
        c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])
    assert [x["event"] for x in c.get_revision_history(PACT, 0, 2)] == ["PROPOSED", "CANCELLED"]
    with direct_vm.expect_revert("Invalid revision-history limit"):
        c.get_revision_history(PACT, 0, 21)

    pending = propose_revision(direct_vm, c, direct_alice)
    direct_vm.warp(iso(NOW + 86400))
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("expired"):
        c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])
    c.expire_revision(PACT)
    assert c.get_pact(PACT)["pending_revision"] is None
    with direct_vm.expect_revert("No pending revision"):
        c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])


def test_funding_rejects_expired_approved_revision_without_consuming_it(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    pending = propose_revision(direct_vm, c, direct_alice)
    direct_vm.sender = direct_bob; c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])
    direct_vm.warp(iso(NOW + 900 + 7 * 24 * 60 * 60))
    c.expire_unresolved(PACT, 1)
    direct_vm.value = 10**16
    with direct_vm.expect_revert("revision missing or expired"):
        c.fund_next_period(PACT)
    direct_vm.value = 0
    assert c.get_pact(PACT)["pending_revision"]["status"] == "APPROVED"
    assert c.get_period(PACT, 1)["sla_version"] == 1


def test_sla_version_cap_and_pending_revision_does_not_block_original_policy_renewal(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = create(direct_vm, direct_deploy, direct_alice, direct_bob); activate(direct_vm, c, direct_bob)
    pending = propose_revision(direct_vm, c, direct_alice)
    # An unapproved future change does not prevent renewal under the active policy.
    direct_vm.warp(iso(NOW + 1201)); mock_evidence(direct_vm); c.assess_period(PACT, 1)
    direct_vm.sender = direct_bob; direct_vm.value = 10**16; c.fund_next_period(PACT); direct_vm.value = 0
    assert c.get_period(PACT, 2)["sla_version"] == 1
    assert c.get_pact(PACT)["pending_revision"]["proposal_id"] == pending["proposal_id"]
    direct_vm.sender = direct_alice
    c.cancel_revision(PACT, pending["proposal_id"])

    timestamp = NOW + 1201
    for version in range(2, 9):
        updated = revision_terms()
        updated["service_scope"] = f"Version {version} policy for the same service identity."
        pending = propose_revision(direct_vm, c, direct_alice, updated)
        direct_vm.sender = direct_bob
        c.approve_revision(PACT, pending["proposal_id"], pending["base_version"], pending["digest"])
        timestamp += 1201
        direct_vm.warp(iso(timestamp))
        if version == 2:
            # Period 2 is still version 1 because its funding preceded approval.
            mock_evidence(direct_vm)
        else:
            mock_revision_evidence(direct_vm, llm=result("MAJOR"))
        c.assess_period(PACT, c.get_pact(PACT)["period_count"])
        direct_vm.sender = direct_bob; direct_vm.value = 10**16
        c.fund_next_period(PACT); direct_vm.value = 0
        assert c.get_current_period(PACT)["sla_version"] == version
    assert len(c.get_sla_versions(PACT, 0, 8)) == 8
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("version limit reached"):
        c.propose_revision(PACT, json.dumps(revision_terms()))
