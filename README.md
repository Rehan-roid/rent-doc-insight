# LeaseLens

<div align="center">

<h1>🔍 LeaseLens</h1>
<p><strong>Understand it. Question it. Get it in writing.</strong></p>

*An evidence-first AI collaborator and document analysis system for Indian residential leases, leave-and-license agreements, PG arrangements, and student housing.*

[![Python](https://img.shields.io/badge/Python-3.11%2B%20%7C%203.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20TanStack-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://tanstack.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-25%20Passed-2ea44f?style=for-the-badge&logo=pytest&logoColor=white)](https://pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview & Philosophy](#-overview--philosophy)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Core Features & Innovations](#-core-features--innovations)
  - [1. Plain-English Analysis & Key Terms](#1-plain-english-analysis--key-terms)
  - [2. Multi-Tier Evidence Verification Engine](#2-multi-tier-evidence-verification-engine)
  - [3. Five Cross-Clause Interaction Patterns](#3-five-cross-clause-interaction-patterns)
  - [4. Deterministic Early-Exit Financial Arithmetic](#4-deterministic-early-exit-financial-arithmetic)
  - [5. Strict Neutrality & Language Guardrails](#5-strict-neutrality--language-guardrails)
  - [6. Privacy-First PII Redaction](#6-privacy-first-pii-redaction)
  - [7. Written-Agreement Tracker & Polite Message Generator](#7-written-agreement-tracker--polite-message-generator)
  - [8. Signing & Move-in Checklist](#8-signing--move-in-checklist)
  - [9. Formatted Export & Print Stylesheet](#9-formatted-export--print-stylesheet)
- [Project Directory Structure](#-project-directory-structure)
- [Backend Pipeline Deep Dive](#-backend-pipeline-deep-dive)
- [API Reference](#-api-reference)
- [Frontend Architecture & Screens](#-frontend-architecture--screens)
- [Benchmark Fixtures & Test Data](#-benchmark-fixtures--test-data)
- [Getting Started & Local Development](#-getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (FastAPI)](#backend-setup-fastapi)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
  - [Environment Variables](#environment-variables)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security, Privacy & Compliance](#-security-privacy--compliance)
- [Disclaimer](#-disclaimer)

---

## 💡 Overview & Philosophy

First-time renters, university students, and early-career professionals in India frequently sign 11-month Leave & License agreements, residential leases, and Paying Guest (PG) agreements without legal assistance. Traditional LLM-based document analyzers often hallucinate clauses, provide unqualified legal judgments (e.g., claiming terms are *"illegal"* or *"void"*), or fail at multi-clause financial arithmetic.

**LeaseLens is designed around four strict foundational principles:**

1. **Explain, Never Judge (Strict Neutrality):** Translates legal terminology into plain English without making unauthorized claims about legal validity or enforceability.
2. **Evidence-First Verification:** Every finding, key term, and interaction must link to an exact, verifiable quote from the uploaded agreement. Unverifiable statements are systematically dropped.
3. **Deterministic Financial Math:** All penalty calculations, lock-in exposures, and currency formatting are performed strictly in Python, guaranteeing mathematical precision.
4. **Action-Oriented Resolution:** Transforms ambiguous or unfavorable terms into polite, professionally crafted questions for the landlord, tracked until confirmed in writing.

---

## 🏗️ System Architecture & Data Flow

```text
+-----------------------------------------------------------------------------------+
|                            LeaseLens Frontend (React)                             |
|          TanStack Start / React 19 • TailwindCSS • Radix UI • Lucide Icons        |
+-----------------------------------------+-----------------------------------------+
                                          |
                                analysisService Adapter
                                          |
                              POST /analyze (JSON / PDF)
                                          |
+-----------------------------------------v-----------------------------------------+
|                              FastAPI Backend Pipeline                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  1. Document Intake & Validation (`document_service.py`)                          |
|     - Enforces limits: 60k chars max, 10MB PDF max, 30 pages max                  |
|     - Extracts text via PyMuPDF and normalizes Unicode formatting                 |
|                                                                                   |
|  2. Privacy & PII Redaction (`privacy_service.py`)                                |
|     - Masks Aadhaar, PAN, phone numbers, and email addresses with placeholders    |
|                                                                                   |
|  3. Deterministic Clause Segmentation (`clause_service.py`)                       |
|     - Splits text into numbered clauses (`c1`, `c2`, ...) with character offsets  |
|                                                                                   |
|  4. Structured LLM Extraction (`llm_service.py`)                                  |
|     - Zero-temperature JSON extraction with prompt injection defense              |
|                                                                                   |
|  5. Multi-Tier Evidence Validator (`evidence_validator.py`)                       |
|     - Exact Match -> Normalized Quotes/Dashes -> Cross-Clause -> Fuzzy Recovery   |
|                                                                                   |
|  6. Neutrality & Guardrail Validation (`guardrail_service.py`)                    |
|     - Scans text for restricted words and replaces with objective templates       |
|                                                                                   |
|  7. Rule Engine & 5 Cross-Clause Interactions (`rule_engine.py`, `interaction_...`)|
|     - Keyword tagging, missing term detectors, and multi-clause synergy mapping   |
|                                                                                   |
|  8. Deterministic Financial Calculations (`calculation_service.py`)               |
|     - Month-by-month lock-in exposure table and Indian currency formatters        |
|                                                                                   |
|  9. Internal Consistency Engine (`consistency_service.py`)                        |
|     - Flags conflicting notice periods, words vs figures errors, and mismatches   |
|                                                                                   |
| 10. Personalization Engine (`personalization_service.py`)                         |
|     - Tailors clause order and context notes to renter profile and priorities     |
|                                                                                   |
| 11. Action Engine & Checklist Generator (`action_service.py`)                     |
|     - Pre-populates polite landlord questions, tracker state, and move-in lists   |
|                                                                                   |
+-----------------------------------------+-----------------------------------------+
                                          |
                              FullAnalysisResponse JSON
                                          |
+-----------------------------------------v-----------------------------------------+
|                        Frontend State & Interactive Screens                       |
|        Dashboard • Connected Clauses • Evidence Drawer • Landlord Messages        |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Core Features & Innovations

### 1. Plain-English Analysis & Key Terms
Extracts and validates critical financial and operational terms into prominent summary cards:
- **Monthly Rent:** Extracted and formatted in INR (e.g., `₹18,000`).
- **Security Deposit:** Extracted and checked for refund conditionality (e.g., `₹50,000`).
- **Lock-in Duration:** Extracted with exact start/end dates and remaining balance obligations.
- **Notice Period:** Captured across all termination clauses.
- **Rent Escalation:** Percentage and frequency (e.g., `5% upon renewal`).
- **Agreement Term:** Total duration (e.g., `11 months`).
- **Missing Terms Detection:** Highlights critical unmentioned terms (e.g., *Deposit refund timeline: Not specified in agreement*).

### 2. Multi-Tier Evidence Verification Engine
Every single finding or key term in LeaseLens must be backed by original document evidence. The backend applies a 4-tier verification cascade:
1. **Exact Offset Substring Match:** Verifies the cited quote against the original text within the specified clause boundaries.
2. **Whitespace & Quote Normalization:** Tolerates differences in smart quotes (`“`, `”`, `‘`, `’`), em-dashes (`—`), and multi-space formatting.
3. **Cross-Clause Remapping:** Scans the entire document if a valid quote was attributed to the wrong clause ID by the model.
4. **Fuzzy Match Recovery:** Uses sequence matching (similarity $\ge 0.85$) to recover slightly paraphrased citations.

> If an extracted finding cannot be validated against the source text, it is pruned from the response.

### 3. Five Cross-Clause Interaction Patterns
Lease agreements often contain clauses that appear harmless in isolation but create significant obligations when combined. LeaseLens analyzes 5 deterministic interaction patterns:

| Pattern | Interacting Clauses | Why It Matters |
| :--- | :--- | :--- |
| 🔄 **Early Exit** | Lock-in period + Notice period + Rent forfeiture | Leaving before the lock-in expires requires paying rent for all remaining months regardless of notice served. |
| 💰 **Deposit Return** | Security deposit + Painting/Cleaning deductions + Missing timeline | Landlord may deduct maintenance costs without a clear timeline or joint inspection for refund. |
| 📈 **Rent Growth** | Annual escalation percentage + Agreement renewal terms | Rent automatically escalates on renewal; notice requirements apply if you decline the increase. |
| 🛠️ **Repair Burden** | Maintenance obligations + Damage liability definitions | Broad repair clauses place day-to-day wear-and-tear costs on the tenant. |
| 🚪 **Entry & Privacy** | Landlord inspection rights + Advance notice stipulations | Allows landlord entry without prior appointment or minimum notice if notice is not specified. |

### 4. Deterministic Early-Exit Financial Arithmetic
Financial calculations are executed solely in Python code (never by LLM):
- Computes month-by-month exposure:
  $$\text{Remaining Months} = \max(\text{Lock-In Months} - \text{Leave After Months}, 0)$$
  $$\text{Potential Financial Exposure} = \text{Monthly Rent} \times \text{Remaining Months}$$
- Interactive frontend slider allows renters to see exact rupee amounts for any departure month (e.g., departing at Month 4 during a 6-month lock-in at ₹18,000/month results in **₹36,000** exposure).

### 5. Strict Neutrality & Language Guardrails
LeaseLens maintains an objective, informational tone:
- **Prohibited Words:** `illegal`, `unlawful`, `void`, `valid`, `invalid`, `enforceable`, `unenforceable`, `risky`, `scam`, `trap`, `standard`, `market rate`, `you should sign`, `you should not sign`.
- If prohibited phrasing is detected in LLM-generated output, the guardrail service automatically substitutes neutral explanatory templates while preserving verbatim document quotes.

### 6. Privacy-First PII Redaction
Before any text is processed or transmitted, sensitive Indian personal identification data is masked:
- **Aadhaar Numbers:** `\b\d{4}\s?\d{4}\s?\d{4}\b` $\rightarrow$ `[AADHAAR_REDACTED_1]`
- **PAN Numbers:** `\b[A-Z]{5}[0-9]{4}[A-Z]\b` $\rightarrow$ `[PAN_REDACTED_1]`
- **Phone Numbers:** `\b(?:\+91[\-\s]?)?[6-9]\d{9}\b` $\rightarrow$ `[PHONE_REDACTED_1]`
- **Email Addresses:** Standard RFC pattern $\rightarrow$ `[EMAIL_REDACTED_1]`

### 7. Written-Agreement Tracker & Polite Message Generator
- Generates tailored, polite message drafts for the landlord (e.g., *"Hi, before signing I wanted to check if we could add a 15-day timeline for deposit refund..."*).
- Interactive question status tracking stored in browser `localStorage`:
  `Not asked` $\rightarrow$ `Asked` $\rightarrow$ `Answered` $\rightarrow$ `Agreed in writing` $\rightarrow$ `Resolved`
- Displays persistent reminders emphasizing that verbal assurances should be documented in the signed agreement.

### 8. Signing & Move-in Checklist
- **Before Signing:** Rent & payment date confirmation, deposit refund timeline in writing, lock-in terms, repair limits, signed copy retention.
- **Move-In Day:** Deposit payment receipt, date-stamped condition photos, utility meter readings (power, gas, water), furniture & appliance inventory record.

### 9. Formatted Export & Print Stylesheet
- Copy clean Markdown or plain text summaries with one click.
- Dedicated `@media print` stylesheet for formatted PDF export or hardcopy generation before landlord meetings.

---

## 📁 Project Directory Structure

```text
leaselens/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py              # FastAPI endpoint routes (/health, /sample, /analyze)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── action_service.py      # Action plan & checklist generation
│   │   │   ├── analysis_service.py    # Pipeline orchestrator & fallback handler
│   │   │   ├── calculation_service.py # Deterministic Python financial arithmetic
│   │   │   ├── clause_service.py      # Clause segmentation & indexing
│   │   │   ├── consistency_service.py # Internal conflict & notice discrepancy checks
│   │   │   ├── document_service.py    # PyMuPDF extraction, limit validation
│   │   │   ├── evidence_validator.py  # 4-tier exact/normalized/fuzzy quote validator
│   │   │   ├── guardrail_service.py   # Neutrality validation & restricted word scrubber
│   │   │   ├── interaction_engine.py  # 5 cross-clause interaction patterns
│   │   │   ├── llm_service.py         # LLM prompt construction & JSON extraction
│   │   │   ├── personalization_service.py # Role & stay-based re-ranking
│   │   │   ├── privacy_service.py     # Aadhaar, PAN, phone, email PII masking
│   │   │   └── rule_engine.py         # Keyword tagging & missing item detection
│   │   ├── __init__.py
│   │   ├── config.py                  # Pydantic Settings & environment config
│   │   ├── main.py                    # FastAPI application initialization & CORS
│   │   └── schemas.py                 # Pydantic v2 data models & validation contracts
│   ├── sample/
│   │   ├── demo_agreement.txt         # 11-month benchmark Leave & License agreement
│   │   ├── demo_analysis.json         # Standalone verified reference response
│   │   └── demo_expected.json         # Golden test expectation values
│   ├── tests/
│   │   ├── conftest.py                # Pytest fixtures & sample loaders
│   │   ├── test_calculations_and_numbers.py
│   │   ├── test_consistency_and_privacy.py
│   │   ├── test_evidence_validator.py
│   │   ├── test_guardrail_service.py
│   │   ├── test_health_and_sample.py
│   │   ├── test_pipeline_integration.py
│   │   └── test_rule_and_interactions.py
│   ├── requirements.txt               # Backend dependencies
│   └── README.md                      # Backend documentation
├── src/
│   ├── components/                    # UI Components (Cards, Badges, Modals, Sliders)
│   ├── hooks/
│   │   ├── use-demo-state.tsx         # Central state store (analysis, filters, tracker)
│   │   └── use-mobile.tsx
│   ├── routes/
│   │   ├── action-plan.tsx            # Landlord question tracker & message copier
│   │   ├── checklist.tsx              # Pre-signing & move-in checklist
│   │   ├── context.tsx                # Renter profile & priority questionnaire
│   │   ├── dashboard.tsx              # Executive summary & key terms
│   │   ├── early-exit.tsx             # Interactive financial slider & connected clauses
│   │   ├── findings.tsx               # Evidence-backed findings & clause drawer
│   │   ├── index.tsx                  # Landing page
│   │   ├── reading.tsx                # Processing animation screen
│   │   ├── summary.tsx                # Formatted summary & print export
│   │   └── upload.tsx                 # Drag-and-drop PDF upload & text paste
│   ├── services/
│   │   └── analysis-service.ts        # API client & fallback adapter
│   ├── types/
│   │   ├── backend.ts                 # TypeScript interfaces matching backend schemas
│   │   └── lease.ts                   # UI domain types
│   ├── app.tsx                        # Root application component
│   ├── entry-client.tsx
│   ├── entry-server.tsx
│   ├── index.css                      # Global styles & design system tokens
│   └── routeTree.gen.ts
├── package.json                       # Frontend dependencies & scripts
├── vite.config.ts                     # Vite build configuration
└── README.md                          # Project documentation
```

---

## 🔬 Backend Pipeline Deep Dive

The backend processes rental documents through an 11-stage pipeline:

```
Uploaded Document (PDF / Text)
       │
       ▼
1. Document Validation (app/services/document_service.py)
   - PyMuPDF text extraction; size check (max 60k chars, max 10MB, max 30 pages)
       │
       ▼
2. PII Masking (app/services/privacy_service.py)
   - Aadhaar, PAN, phone, and email addresses redacted
       │
       ▼
3. Clause Segmentation (app/services/clause_service.py)
   - Splits document into numbered clauses (c1, c2, c3...) with character offsets
       │
       ▼
4. Model Extraction (app/services/llm_service.py)
   - Temperature 0 structured JSON extraction with system prompt guardrails
       │
       ▼
5. Evidence Verification (app/services/evidence_validator.py)
   - Verifies quotes against source text; drops hallucinated or unverified quotes
       │
       ▼
6. Neutrality Guardrails (app/services/guardrail_service.py)
   - Replaces restricted/subjective legal words with neutral explanatory text
       │
       ▼
7. Rule & Interaction Engine (app/services/rule_engine.py & interaction_engine.py)
   - Evaluates early exit, deposit return, rent growth, repairs, and entry rights
       │
       ▼
8. Financial Arithmetic (app/services/calculation_service.py)
   - Calculates month-by-month lock-in exposure table and INR currency values
       │
       ▼
9. Consistency Verification (app/services/consistency_service.py)
   - Flags notice period conflicts and numerical discrepancies
       │
       ▼
10. Personalization (app/services/personalization_service.py)
    - Re-ranks findings based on renter role (student/professional) and priority
       │
       ▼
11. Action Generation (app/services/action_service.py)
    - Generates landlord question tracker, message drafts, and signing checklists
       │
       ▼
FullAnalysisResponse JSON
```

---

## 📡 API Reference

### 1. Health Check
```http
GET /health
```
**Response (`200 OK`):**
```json
{
  "status": "ok"
}
```

### 2. Sample Benchmark Agreement
```http
GET /sample
```
**Response (`200 OK`):**
```json
{
  "filename": "demo_agreement.txt",
  "text": "LEAVE AND LICENSE AGREEMENT\n\nThis Leave and License Agreement..."
}
```

### 3. Analyze Agreement
```http
POST /analyze
Content-Type: application/json
```
**Request Body:**
```json
{
  "text": "1. Term: 11 months...\n2. Rent: Rs. 18,000/- per month...",
  "context": {
    "role": "student",
    "expected_stay": "under_6_months",
    "priority": "flexibility"
  }
}
```
*Also supports `multipart/form-data` with a `file` (PDF) and optional `context` string.*

**Sample Response (`200 OK`):**
```json
{
  "document": {
    "analysis_id": "9b1deb4d3b7d4e8b",
    "filename": "demo_agreement.txt",
    "clauses": [
      {
        "id": "c2",
        "label": "2",
        "title": "Monthly License Fee",
        "text": "The Licensee shall pay to the Licensor a monthly license fee (rent) of Rupees Eighteen Thousand (Rs. 18,000/-) per month.",
        "start_char": 420,
        "end_char": 542
      }
    ]
  },
  "key_terms": [
    {
      "type": "rent",
      "status": "found",
      "label": "Monthly Rent",
      "value": "₹18,000",
      "numeric_value": 18000.0,
      "unit": "INR",
      "evidence": {
        "clause_id": "c2",
        "clause_label": "2",
        "quote": "The Licensee shall pay to the Licensor a monthly license fee (rent) of Rupees Eighteen Thousand (Rs. 18,000/-) per month."
      }
    }
  ],
  "interactions": [
    {
      "id": "interaction_early_exit",
      "pattern": "early_exit",
      "title": "Lock-in period with full remaining rent obligation",
      "clauses_involved": ["c4", "c7"],
      "summary": "Leaving before the 6-month lock-in period requires paying rent for all remaining lock-in months.",
      "calculation": {
        "formula": "Monthly Rent x (Lock-in Months - Month Left)",
        "example_output": "Leaving at month 4: ₹18,000 x 2 = ₹36,000"
      },
      "question_for_counterparty": "If I need to move out before the 6-month lock-in ends, is the balance rent obligation strictly enforced if a replacement tenant is found?"
    }
  ],
  "meta": {
    "analysis_version": "1.0",
    "mode": "live",
    "disclaimer": "This explains the document. It isn't legal advice.",
    "validation": {
      "quotes_verified": 12,
      "quotes_recovered": 0,
      "items_dropped": 0,
      "guardrail_replacements": 0
    }
  }
}
```

---

## 🎨 Frontend Architecture & Screens

The user interface is built with **TanStack Start (React 19)**, **TailwindCSS**, and **Radix UI**:

| Route | Screen Name | Key Functionality |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Value proposition, feature highlights, and sample agreement one-click triggers |
| `/upload` | **Document Intake** | Drag-and-drop PDF upload or direct text paste with character counter |
| `/context` | **Renter Profile** | Role selection (Student, Working Professional, Family), stay duration, and priorities |
| `/reading` | **Analysis Screen** | Multi-step progress animation showing active pipeline stages |
| `/dashboard` | **Executive Overview** | Key terms summary grid, high-attention findings, and context alert banners |
| `/early-exit` | **Connected Clauses** | Interactive lock-in financial slider and 5 cross-clause interaction pattern cards |
| `/findings` | **Evidence & Findings** | Categorized findings with direct links opening the verbatim clause drawer |
| `/action-plan` | **Landlord Tracker** | Written confirmation status tracker (`Not asked` $\rightarrow$ `Agreed in writing`) and polite message copier |
| `/checklist` | **Signing Checklist** | Interactive pre-signing and move-in day verification checklists |
| `/summary` | **Export & Review** | One-click Markdown/plain-text copy and formatted print view |

---

## 📄 Benchmark Fixtures & Test Data

The benchmark agreement fixture located at `backend/sample/demo_agreement.txt` provides an end-to-end test case featuring:
- **Rent:** `₹18,000` per month due by the 5th of each calendar month.
- **Deposit:** `₹50,000` with mandatory painting/cleaning deductions and **no refund timeline**.
- **Clause 4.2 (Lock-in):** 6-month lock-in requiring balance rent payment upon premature departure.
- **Clause 7.1 (Notice):** 60-day notice requirement following lock-in expiration.
- **Clause 9.3 (Conflicting Notice):** Contradictory clause stating 1 month's notice.
- **Repairs:** Broad clause assigning all minor and major repair costs to the licensee.
- **Entry:** Unrestricted inspection rights for the licensor without advance notice.
- **PII:** Synthetic Aadhaar, PAN, phone numbers, and email addresses for redaction testing.

All expectations are verified against `backend/sample/demo_expected.json`.

---

## ⚙️ Getting Started & Local Development

### Prerequisites
- **Node.js** (v18.0+ or v20.0+) and **npm**
- **Python** (v3.11, v3.12, v3.13, or v3.14)
- **Git**

### Backend Setup (FastAPI)

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
# source .venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. (Optional) Configure environment variables
cp .env.example .env

# 5. Start FastAPI development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend API will be available at `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`).*

### Frontend Setup (React + Vite)

```bash
# 1. In a separate terminal at the project root:
npm install

# 2. Start Vite development server
npm run dev
```
*Frontend application will be available at `http://localhost:5173`.*

### Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `8000` | Port for the FastAPI server |
| `APP_ENV` | `development` | Environment mode (`development` / `production`) |
| `OPENAI_API_KEY` | *(optional)* | OpenAI API key for live LLM extraction |
| `GEMINI_API_KEY` | *(optional)* | Gemini API key for live LLM extraction |
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL for frontend client |

> **Note:** LeaseLens includes a deterministic extraction engine and sample fixtures, allowing complete local development and testing without external API keys.

---

## 🧪 Testing & Quality Assurance

The backend contains a comprehensive test suite executed with `pytest`:

```bash
cd backend
.venv\Scripts\pytest -v
```

### Test Suite Summary (25/25 Tests Passing)

```text
============================= test session starts =============================
collected 25 items

tests/test_calculations_and_numbers.py::test_parse_inr_numbers PASSED
tests/test_calculations_and_numbers.py::test_calculate_early_exit_exposure PASSED
tests/test_calculations_and_numbers.py::test_calculate_zero_exposure_after_lockin PASSED
tests/test_consistency_and_privacy.py::test_detect_conflicting_notice_periods PASSED
tests/test_consistency_and_privacy.py::test_mask_pii_entities PASSED
tests/test_evidence_validator.py::test_exact_quote_validation PASSED
tests/test_evidence_validator.py::test_quote_with_curly_quotes_and_dashes PASSED
tests/test_evidence_validator.py::test_cross_clause_quote_recovery PASSED
tests/test_evidence_validator.py::test_fuzzy_quote_recovery PASSED
tests/test_evidence_validator.py::test_unverifiable_quote_fails PASSED
tests/test_guardrail_service.py::test_detects_restricted_words PASSED
tests/test_guardrail_service.py::test_replaces_restricted_phrasing PASSED
tests/test_guardrail_service.py::test_preserves_evidence_quotes PASSED
tests/test_health_and_sample.py::test_health_endpoint PASSED
tests/test_health_and_sample.py::test_sample_endpoint PASSED
tests/test_pipeline_integration.py::test_demo_agreement_end_to_end PASSED
tests/test_pipeline_integration.py::test_empty_or_invalid_document PASSED
tests/test_pipeline_integration.py::test_pdf_processing_simulation PASSED
tests/test_pipeline_integration.py::test_prompt_injection_defense PASSED
tests/test_rule_and_interactions.py::test_early_exit_interaction PASSED
tests/test_rule_and_interactions.py::test_deposit_return_interaction PASSED
tests/test_rule_and_interactions.py::test_rent_growth_interaction PASSED
tests/test_rule_and_interactions.py::test_repair_burden_interaction PASSED
tests/test_rule_and_interactions.py::test_entry_privacy_interaction PASSED
tests/test_rule_and_interactions.py::test_missing_terms_detection PASSED

============================== 25 passed in 1.42s ==============================
```

---

## 🔒 Security, Privacy & Compliance

- **Stateless Document Processing:** Uploaded documents are processed in memory and never stored in databases.
- **Client-Side Storage:** Action plan status, checkboxes, and notes are stored exclusively in the user's browser `localStorage`.
- **Zero Hallucination Tolerance:** Findings require verified quotes from source text; unverified assertions are dropped.
- **Prompt Injection Defense:** Agreement text is strictly encapsulated inside `<agreement_clauses>` XML boundaries and treated as untrusted data.

---

## ⚖️ Disclaimer

**LeaseLens explains documents; it is not a law firm and does not provide legal advice.**  
All analyses, financial exposures, and summaries are generated for informational purposes based strictly on the provided agreement text. For legal disputes or formal opinions, consult a qualified legal advocate.

---

<div align="center">

**LeaseLens** — *Understand it. Question it. Get it in writing.*

</div>
