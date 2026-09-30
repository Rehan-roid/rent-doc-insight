# LeaseLens Backend

Evidence-first analysis backend for Indian rental agreements.

## Features
- **Deterministic Pipeline:** Strict number parsing, Indian currency formatting (`₹`), 5 cross-clause interaction patterns, and internal consistency checks.
- **Evidence Verification:** Every quote cited is verified against the original text using exact and fuzzy matching. Findings without verified quotes are dropped.
- **Guardrails:** Scans model-written text for restricted legal judgments (`illegal`, `void`, `enforceable`, `standard`, `market rate`, etc.) and replaces them with neutral guidance.
- **Privacy Redaction:** Automatically masks Aadhaar, PAN, phone numbers, and emails before LLM processing while preserving dates, rent, and deposit figures.
- **Calculations:** Deterministic early-exit exposure calculations for the entire lock-in duration.

## Setup & Running

```bash
# 1. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env

# 4. Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Running Tests

```bash
pytest
```

## API Endpoints
- `GET /health` — Health check endpoint.
- `GET /sample` — Returns the benchmark demo agreement.
- `POST /analyze` — Analyzes agreement text or uploaded PDF with optional user context.
