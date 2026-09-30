"""Test rule engine, keyword tags, missing items, and 5 deterministic interaction patterns."""
from app.schemas import Clause, LLMOutput
from app.services.rule_engine import detect_interactions, detect_missing, keyword_tags


def test_keyword_tags():
    text = "The monthly rent is Rs. 18,000/- with a 6-month lock-in and 60 days notice."
    tags = keyword_tags(text)
    assert "rent_payment" in tags
    assert "lock_in" in tags
    assert "notice" in tags


def test_entry_without_notice_triggers_interaction():
    clauses = [
        Clause(
            id="c8",
            label="Clause 8",
            text="The Licensor shall be entitled to enter and inspect the premises at any time.",
            start=0,
            end=77,
        )
    ]
    interactions = detect_interactions(clauses, LLMOutput())
    patterns = [i["pattern"] for i in interactions]
    assert "entry_privacy" in patterns


def test_entry_with_notice_does_not_trigger_interaction():
    # If the clause explicitly requires 24 hours prior notice, entry_privacy pattern must NOT trigger
    clauses = [
        Clause(
            id="c8",
            label="Clause 8",
            text="The Licensor may enter the premises after giving 24 hours prior notice and appointment.",
            start=0,
            end=88,
        )
    ]
    interactions = detect_interactions(clauses, LLMOutput())
    patterns = [i["pattern"] for i in interactions]
    assert "entry_privacy" not in patterns


def test_early_exit_interaction_detected():
    clauses = [
        Clause(id="c1", label="Clause 1", text="There shall be a 6-month lock-in period.", start=0, end=40),
        Clause(id="c2", label="Clause 2", text="Either party may terminate by giving 60 days notice.", start=41, end=93),
        Clause(id="c3", label="Clause 3", text="Early termination during lock-in requires paying remaining rent balance.", start=94, end=166),
    ]
    interactions = detect_interactions(clauses, LLMOutput())
    patterns = [i["pattern"] for i in interactions]
    assert "early_exit" in patterns


def test_missing_deposit_refund_timeline_detected():
    clauses = [
        Clause(
            id="c1",
            label="Clause 1",
            text="The Licensee has deposited a security deposit of Rs. 50,000. Licensor may deduct repair costs.",
            start=0,
            end=94,
        )
    ]
    missing = detect_missing(clauses, LLMOutput())
    assert "deposit_refund_timeline" in missing
