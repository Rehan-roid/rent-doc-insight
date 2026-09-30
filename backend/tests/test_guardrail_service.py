"""Test guardrail service, restricted words detection, and neutral template replacement."""
from app.schemas import ValidationStats
from app.services.guardrail_service import check_field


def test_restricted_words_detected_and_replaced():
    stats = ValidationStats()

    # Direct restricted word: illegal
    bad_plain = "This clause is completely illegal under local laws."
    cleaned = check_field(bad_plain, "plain_english", stats)
    assert "illegal" not in cleaned.lower()
    assert "worth reading carefully" in cleaned
    assert stats.guardrail_replacements == 1

    # Advice / sign recommendation
    bad_impact = "You should not sign this agreement without revisions."
    cleaned_impact = check_field(bad_impact, "tenant_impact", stats)
    assert "should not sign" not in cleaned_impact.lower()
    assert "clarifying with the landlord" in cleaned_impact
    assert stats.guardrail_replacements == 2

    # Market rate / standard
    bad_explanation = "This penalty is not standard and is far above market rate."
    cleaned_exp = check_field(bad_explanation, "explanation", stats)
    assert "market rate" not in cleaned_exp.lower()
    assert "standard" not in cleaned_exp.lower()
    assert stats.guardrail_replacements == 3


def test_clean_text_passes_untouched():
    stats = ValidationStats()
    clean = "This clause specifies that notice must be given sixty days prior to vacating."
    result = check_field(clean, "plain_english", stats)
    assert result == clean
    assert stats.guardrail_replacements == 0
