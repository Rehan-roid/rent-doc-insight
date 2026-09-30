"""Generate benchmark fixtures: demo_analysis.json and demo_expected.json."""
import asyncio
import json
from pathlib import Path

from app.schemas import UserContext
from app.services.analysis_service import analyze_document


async def main():
    sample_dir = Path(__file__).parent / "sample"
    demo_agreement_file = sample_dir / "demo_agreement.txt"
    demo_text = demo_agreement_file.read_text(encoding="utf-8")

    # Run analysis with student role context
    ctx = UserContext(role="student", expected_stay="under_6_months", priority="flexibility")
    analysis = await analyze_document(raw_text=demo_text, filename="demo_agreement.txt", context=ctx)

    # Save demo_analysis.json
    analysis_dict = analysis.model_dump(mode="json")
    out_analysis = sample_dir / "demo_analysis.json"
    out_analysis.write_text(json.dumps(analysis_dict, indent=2), encoding="utf-8")
    print(f"Generated {out_analysis}")

    # Golden expectations
    expected = {
        "key_terms": {
            "rent": {"status": "found", "numeric_value": 18000, "unit": "INR"},
            "deposit": {"status": "found", "numeric_value": 50000, "unit": "INR"},
            "lock_in": {"status": "found", "numeric_value": 6, "unit": "months"},
            "notice": {"status": "found", "numeric_value": 60, "unit": "days"},
        },
        "early_exit_exposure_month_4": 36000,
        "required_patterns": ["early_exit", "deposit_return", "rent_growth", "repair_burden", "entry_privacy"],
        "inconsistency_found": True,
        "missing_items": [m.item for m in analysis.missing],
    }

    out_expected = sample_dir / "demo_expected.json"
    out_expected.write_text(json.dumps(expected, indent=2), encoding="utf-8")
    print(f"Generated {out_expected}")


if __name__ == "__main__":
    asyncio.run(main())
