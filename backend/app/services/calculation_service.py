"""Calculation service — early-exit calculations and Indian number formatting."""
from __future__ import annotations

from typing import Optional

from app.schemas import Calculation, ExposurePoint, KeyTerm, PenaltyType, EXPOSURE_WORDING
from app.utils.number_utils import format_inr


def compute_early_exit(
    rent_term: Optional[KeyTerm],
    lock_in_term: Optional[KeyTerm],
    deposit_term: Optional[KeyTerm],
    penalty_type: PenaltyType = "none_stated",
    penalty_fixed_amount: Optional[int] = None,
    clause_ref_rent: Optional[str] = "Clause 2",
) -> Calculation:
    """Compute early-exit financial exposure for each month in the lock-in period.

    Financial arithmetic is handled strictly in Python, never delegated to the LLM.
    """
    # Verify required inputs
    if not lock_in_term or lock_in_term.status != "found" or not lock_in_term.numeric_value:
        return Calculation(
            available=False,
            reason_unavailable="Lock-in period not specified — ask the landlord.",
            wording=EXPOSURE_WORDING,
        )

    lock_in_months = int(lock_in_term.numeric_value)
    if lock_in_months <= 0:
        return Calculation(
            available=False,
            reason_unavailable="Lock-in period not specified — ask the landlord.",
            wording=EXPOSURE_WORDING,
        )

    rent_amount: Optional[int] = None
    if rent_term and rent_term.status == "found" and rent_term.numeric_value:
        rent_amount = int(rent_term.numeric_value)

    deposit_amount: Optional[int] = None
    if deposit_term and deposit_term.status == "found" and deposit_term.numeric_value:
        deposit_amount = int(deposit_term.numeric_value)

    # Determine calculation feasibility
    if penalty_type == "remaining_rent":
        if not rent_amount:
            return Calculation(
                available=False,
                reason_unavailable="Amount not specified — ask the landlord.",
                wording=EXPOSURE_WORDING,
            )
    elif penalty_type == "fixed_amount":
        if not penalty_fixed_amount:
            return Calculation(
                available=False,
                reason_unavailable="Amount not specified — ask the landlord.",
                wording=EXPOSURE_WORDING,
            )
    elif penalty_type == "deposit_forfeiture":
        if not deposit_amount:
            return Calculation(
                available=False,
                reason_unavailable="Amount not specified — ask the landlord.",
                wording=EXPOSURE_WORDING,
            )
    else:
        return Calculation(
            available=False,
            reason_unavailable="Amount not specified — ask the landlord.",
            wording=EXPOSURE_WORDING,
        )

    exposure_by_month: list[ExposurePoint] = []
    for month in range(1, lock_in_months + 1):
        remaining = max(lock_in_months - month, 0)
        if penalty_type == "remaining_rent" and rent_amount is not None:
            amt = remaining * rent_amount
            formula_str = (
                f"{remaining} remaining month{'s' if remaining != 1 else ''} × {format_inr(rent_amount)}"
                if remaining > 0
                else "No remaining lock-in period"
            )
        elif penalty_type == "fixed_amount" and penalty_fixed_amount is not None:
            amt = penalty_fixed_amount if remaining > 0 else 0
            formula_str = f"Fixed penalty {format_inr(penalty_fixed_amount)}" if remaining > 0 else "Lock-in completed"
        elif penalty_type == "deposit_forfeiture" and deposit_amount is not None:
            amt = deposit_amount if remaining > 0 else 0
            formula_str = f"Forfeiture of security deposit ({format_inr(deposit_amount)})" if remaining > 0 else "Lock-in completed"
        else:
            amt = 0
            formula_str = "No penalty applicable"

        exposure_by_month.append(
            ExposurePoint(
                leave_after_months=month,
                amount=amt,
                formula=formula_str,
            )
        )

    # Default leave after months (demo specifies 4 if lock-in is 6, or max(1, lock_in - 2))
    default_leave = 4 if lock_in_months == 6 else max(1, lock_in_months - 2)

    rent_ref_str = f" ({clause_ref_rent})" if clause_ref_rent else ""
    assumptions = [
        f"Uses monthly rent of {format_inr(rent_amount)}{rent_ref_str}." if rent_amount else "",
        f"Counts only the remaining lock-in months of the {lock_in_months}-month lock-in.",
        "Does not include any other charges, taxes or deductions.",
    ]
    assumptions = [a for a in assumptions if a]

    return Calculation(
        available=True,
        currency="INR",
        default_leave_after_months=default_leave,
        exposure_by_month=exposure_by_month,
        assumptions=assumptions,
        wording=EXPOSURE_WORDING,
    )
