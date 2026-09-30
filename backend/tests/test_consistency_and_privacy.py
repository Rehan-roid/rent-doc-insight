"""Test internal consistency checks and privacy redaction."""
from app.schemas import Clause
from app.services.consistency_service import find_inconsistencies
from app.services.privacy_service import redact


def test_inconsistency_two_different_notice_periods():
    clauses = [
        Clause(
            id="c7_1",
            label="Clause 7.1",
            text="Either party may terminate by serving sixty (60) days prior written notice.",
            start=0,
            end=75,
        ),
        Clause(
            id="c9_3",
            label="Clause 9.3",
            text="The Licensee shall provide one month's notice in writing to the Licensor.",
            start=76,
            end=148,
        ),
    ]

    inconsistencies = find_inconsistencies(clauses)
    assert len(inconsistencies) >= 1
    inc = inconsistencies[0]
    assert inc.kind == "notice_period"
    assert len(inc.evidence) == 2
    assert "sixty (60) days" in inc.evidence[0].quote
    assert "one month's notice" in inc.evidence[1].quote


def test_privacy_redacts_pii_preserves_rent_and_deposit():
    raw_text = (
        "Mr. Sharma, holding PAN ABCDE1234F and Aadhaar 1234 5678 9012, "
        "phone +91 9876543210, email test@example.com, agrees to rent for Rs. 18,000/- "
        "and security deposit of Rs. 50,000/- starting 1st May 2026."
    )

    redacted = redact(raw_text)
    masked = redacted.masked_text

    # PII is masked
    assert "ABCDE1234F" not in masked
    assert "1234 5678 9012" not in masked
    assert "9876543210" not in masked
    assert "test@example.com" not in masked

    # Stable placeholders used
    assert "[PAN_REDACTED_" in masked
    assert "[AADHAAR_REDACTED_" in masked
    assert "[PHONE_REDACTED_" in masked
    assert "[EMAIL_REDACTED_" in masked

    # Rent, deposit, dates preserved
    assert "Rs. 18,000/-" in masked
    assert "Rs. 50,000/-" in masked
    assert "1st May 2026" in masked
