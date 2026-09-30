"""Test evidence validation, quote matching, normalization, and fuzzy recovery."""
from app.schemas import Clause, ValidationStats
from app.services.evidence_validator import verify_quote


def test_valid_quote_passes():
    clause = Clause(
        id="c1",
        label="Clause 1",
        text="The monthly rent shall be Rupees Eighteen Thousand (Rs. 18,000/-) payable in advance.",
        start=0,
        end=86,
    )
    clauses_by_id = {"c1": clause}
    stats = ValidationStats()

    ev = verify_quote("Rupees Eighteen Thousand", "c1", clauses_by_id, stats)
    assert ev is not None
    assert ev.clause_id == "c1"
    assert ev.quote == "Rupees Eighteen Thousand"
    assert stats.quotes_verified == 1


def test_fake_quote_fails():
    clause = Clause(
        id="c1",
        label="Clause 1",
        text="The monthly rent shall be Rupees Eighteen Thousand.",
        start=0,
        end=50,
    )
    clauses_by_id = {"c1": clause}
    stats = ValidationStats()

    ev = verify_quote("This text does not exist anywhere in the clause", "c1", clauses_by_id, stats)
    assert ev is None
    assert stats.items_dropped == 1


def test_whitespace_and_curly_quote_normalization():
    clause = Clause(
        id="c1",
        label="Clause 1",
        text="The tenant shall give “sixty days” written notice.",
        start=0,
        end=50,
    )
    clauses_by_id = {"c1": clause}
    stats = ValidationStats()

    # User or model provided straight quotes and extra space
    ev = verify_quote('"sixty  days"', "c1", clauses_by_id, stats)
    assert ev is not None
    assert ev.clause_id == "c1"
    assert stats.quotes_verified == 1


def test_quote_remapped_to_correct_clause():
    c1 = Clause(id="c1", label="Clause 1", text="Rent is paid monthly.", start=0, end=21)
    c2 = Clause(id="c2", label="Clause 2", text="There shall be a strict lock-in period of six months.", start=22, end=75)
    clauses_by_id = {"c1": c1, "c2": c2}
    stats = ValidationStats()

    # Model cited c1 by mistake, but quote is actually in c2
    ev = verify_quote("strict lock-in period of six months", "c1", clauses_by_id, stats)
    assert ev is not None
    assert ev.clause_id == "c2"
    assert stats.quotes_verified == 1


def test_fuzzy_recovery_recovers_sentence():
    c1 = Clause(
        id="c1",
        label="Clause 1",
        text="The Licensor and his authorised representatives shall be entitled to enter and inspect the Scheduled Premises at any time.",
        start=0,
        end=123,
    )
    clauses_by_id = {"c1": c1}
    stats = ValidationStats()

    # Model hallucinated slightly or paraphrased
    imperfect_quote = "Licensor representatives are entitled to enter and inspect Scheduled Premises at any time"
    ev = verify_quote(imperfect_quote, "c1", clauses_by_id, stats)
    assert ev is not None
    assert ev.clause_id == "c1"
    assert "enter and inspect" in ev.quote
    assert stats.quotes_recovered == 1
