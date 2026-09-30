"""Test number parsing, currency formatting, and early-exit financial calculations."""
from app.schemas import KeyTerm
from app.services.calculation_service import compute_early_exit
from app.utils.number_utils import (
    extract_currency_amount,
    extract_duration,
    extract_percent,
    format_inr,
)


def test_number_and_currency_parsing():
    assert extract_currency_amount("Rs. 18,000/-") == 18000.0
    assert extract_currency_amount("₹1,80,000") == 180000.0
    assert extract_currency_amount("INR 50000") == 50000.0
    assert extract_currency_amount("Rupees Fifty Thousand") == 50000.0
    assert extract_currency_amount("Fifty Thousand (50,000)") == 50000.0
    assert extract_currency_amount("1.5 lakh") == 150000.0


def test_duration_and_percentage_parsing():
    dur_days = extract_duration("sixty (60) days notice")
    assert dur_days is not None
    assert dur_days.value == 60
    assert dur_days.unit == "days"

    dur_months = extract_duration("two months notice")
    assert dur_months is not None
    assert dur_months.value == 2
    assert dur_months.unit == "months"

    pct = extract_percent("annual increase of 5 per cent")
    assert pct == 5.0


def test_format_inr():
    assert format_inr(18000) == "₹18,000"
    assert format_inr(180000) == "₹1,80,000"
    assert format_inr(500) == "₹500"
    assert format_inr(10000000) == "₹1,00,00,000"


def test_early_exit_calculation_remaining_rent():
    rent_term = KeyTerm(type="rent", status="found", label="Monthly Rent", numeric_value=18000, unit="INR")
    lock_in_term = KeyTerm(type="lock_in", status="found", label="Lock-in", numeric_value=6, unit="months")
    deposit_term = KeyTerm(type="deposit", status="found", label="Deposit", numeric_value=50000, unit="INR")

    calc = compute_early_exit(
        rent_term=rent_term,
        lock_in_term=lock_in_term,
        deposit_term=deposit_term,
        penalty_type="remaining_rent",
    )

    assert calc.available is True
    assert calc.default_leave_after_months == 4
    assert len(calc.exposure_by_month) == 6

    # Month 4: 2 remaining months * 18,000 = 36,000
    m4 = next(p for p in calc.exposure_by_month if p.leave_after_months == 4)
    assert m4.amount == 36000
    assert "2 remaining months" in m4.formula

    # Month 6 (end of lock-in): 0 remaining months
    m6 = next(p for p in calc.exposure_by_month if p.leave_after_months == 6)
    assert m6.amount == 0


def test_early_exit_unspecified_penalty():
    rent_term = KeyTerm(type="rent", status="found", label="Monthly Rent", numeric_value=18000, unit="INR")
    lock_in_term = KeyTerm(type="lock_in", status="found", label="Lock-in", numeric_value=6, unit="months")
    deposit_term = KeyTerm(type="deposit", status="found", label="Deposit", numeric_value=50000, unit="INR")

    calc = compute_early_exit(
        rent_term=rent_term,
        lock_in_term=lock_in_term,
        deposit_term=deposit_term,
        penalty_type="none_stated",
    )

    assert calc.available is False
    assert "Amount not specified — ask the landlord." in calc.reason_unavailable
