# LeaseLens

<div align="center">

**Understand it. Question it. Get it in writing.**

*An evidence-first AI assistant and document analysis system for Indian residential rental agreements, leave-and-license agreements, PG arrangements, and student housing.*

[![Python](https://img.shields.io/badge/Python-3.11%2B%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20TanStack%20Start-61DAFB.svg)](https://tanstack.com/)
[![Tests](https://img.shields.io/badge/Tests-25%20Passed-brightgreen.svg)](https://pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview & Philosophy](#-overview--philosophy)
- [System Architecture](#-system-architecture)
- [Core Features & Capabilities](#-core-features--capabilities)
  - [1. Plain-English Analysis & Key Terms](#1-plain-english-analysis--key-terms)
  - [2. Strict Evidence Verification](#2-strict-evidence-verification)
  - [3. Five Cross-Clause Interaction Patterns](#3-five-cross-clause-interaction-patterns)
  - [4. Early-Exit Financial Arithmetic & Slider](#4-early-exit-financial-arithmetic--slider)
  - [5. Neutrality & Language Guardrails](#5-neutrality--language-guardrails)
  - [6. Privacy-First PII Masking](#6-privacy-first-pii-masking)
  - [7. Written-Agreement Tracker & Polite Message Generator](#7-written-agreement-tracker--polite-message-generator)
  - [8. Signing & Move-in Checklist](#8-signing--move-in-checklist)
  - [9. Native Print & Formatted Export](#9-native-print--formatted-export)
- [Backend Pipeline Deep Dive](#-backend-pipeline-deep-dive)
- [API Reference](#-api-reference)
- [Frontend Architecture & Adapter](#-frontend-architecture--adapter)
- [Benchmark Demo Agreement & Fixtures](#-benchmark-demo-agreement--fixtures)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (FastAPI)](#backend-setup-fastapi)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security, Privacy & Compliance](#-security-privacy--compliance)
- [Disclaimer](#-disclaimer)

---

## 💡 Overview & Philosophy

Most first-time renters, students, and early-career professionals in India sign rental or leave-and-license agreements without legal counsel. Traditional AI document analysis systems often produce generic summaries, hallucinate clauses, or make unauthorized legal judgements (e.g., claiming a clause is "illegal" or "market standard").

**LeaseLens is built on an evidence-first, deterministic foundation:**
1. **Explain, Never Judge:** It translates legal jargon into plain English without declaring terms valid or invalid.
2. **Every Statement Traced:** Every finding and interaction must link to an exact, verifiable quote in the original text. Unverifiable statements are dropped.
3. **Deterministic Financial Math:** All penalty calculations, rupee formatting, and clause interaction patterns are executed strictly in Python code, never left to LLM arithmetic.
4. **Actionable Outcomes:** Unclear clauses are transformed into polite questions for landlords and tracked until confirmed in writing.

---

## 🏗️ System Architecture

```text
+-------------------------------------------------------------------------------+
|                           LeaseLens Web UI (React)                            |
|             (TanStack Start + TailwindCSS + Radix UI + Lucide Icons)          |
+---------------------------------------+---------------------------------------+
                                        |
                             analysisService & Adapter
                                        |
                           POST /analyze (JSON / PDF)
                                        |
+---------------------------------------v---------------------------------------+
|                            FastAPI Backend Pipeline                           |
+-------------------------------------------------------------------------------+
|                                                                               |
|  1. Document Processing & Limits (`document_service.py`)                      |
|     - Validates limits (60k chars, 10MB PDF, 30 pages) & normalizes Unicode    |
|                                                                               |
|  2. Privacy Redaction (`privacy_service.py`)                                  |
|     - Masks Aadhaar, PAN, phones, and emails with stable placeholders         |
|                                                                               |
|  3. Deterministic Clause Segmentation (`clause_service.py`)                   |
|     - Splits text into numbered clauses (c1, c2...) with exact start/end      |
|                                                                               |
|  4. LLM Extraction / Lenient Parsing (`llm_service.py`)                       |
|     - Zero-temperature JSON extraction with prompt injection defense          |
|                                                                               |
|  5. Evidence Verification (`evidence_validator.py`)                           |
|     - Exact match -> Quote/Dash Normalization -> Cross-Clause -> Fuzzy Match  |
|                                                                               |
|  6. Guardrail Validation (`guardrail_service.py`)                             |
|     - Scans model text for restricted terms & replaces with neutral copy      |
|                                                                               |
|  7. Rule Engine & 5 Interaction Patterns (`rule_engine.py`, `interaction_...`) |
|     - Merged tags, missing item detection, and cross-clause synergy detection |
|                                                                               |
|  8. Financial Arithmetic (`calculation_service.py`)                           |
|     - Month-by-month early-exit exposure calculation (Python only)            |
|                                                                               |
|  9. Consistency Checks (`consistency_service.py`)                             |
|     - Detects notice conflicts, words vs figures errors, and rent mismatches  |
|                                                                               |
| 10. Personalization Engine (`personalization_service.py`)                     |
|     - Deterministic re-ordering & context notes by role/stay/priority         |
|                                                                               |
| 11. Action Engine & Checklist Generator (`action_service.py`)                 |
|     - Pre-drafts polite landlord messages, tracker states & checklist items   |
|                                                                               |
+---------------------------------------+---------------------------------------+
                                        |
                            FullAnalysisResponse JSON
                                        |
+---------------------------------------v---------------------------------------+
|                           Frontend Adapter & Reactive Store                   |
|          (`src/services/analysis-service.ts` -> `useDemoState.tsx`)           |
+-------------------------------------------------------------------------------+
```

---

## 🚀 Core Features & Capabilities

### 1. Plain-English Analysis & Key Terms
Extracts critical figures into high-visibility cards:
- Monthly Rent (`₹18,000`), Security Deposit (`₹50,000`), Lock-in Duration (`6 months`), Notice Period (`60 days`), Rent Escalation (`5%`), and Agreement Term (`11 months`).
- Flags missing key terms (e.g. *Deposit Refund Timeline: Not specified*).

### 2. Strict Evidence Verification
Every finding cites source clauses. The backend runs a 4-tier verification algorithm:
1. **Exact Substring Match**: Checks cited clause start and end offsets.
2. **Whitespace & Curly-Quote Resilient Matching**: Normalizes Unicode quotes (`“`, `”`, `‘`, `’`) and dashes (`—`, `–`).
3. **Cross-Clause Remapping**: Automatically finds quotes erroneously cited under another clause index.
4. **Fuzzy Recovery**: Uses sequence matching to recover paraphrased clauses.
*If a quote cannot be verified against the original text, the finding is dropped.*

### 3. Five Cross-Clause Interaction Patterns
LeaseLens deterministically checks for interacting clauses:
- 🔄 **Early Exit**: Lock-in period combined with notice periods and premature termination rent penalties.
- 💰 **Deposit Return**: Deductions (painting/cleaning) paired with missing return deadlines or lack of joint move-out inspection.
- 📈 **Rent Growth**: Automatic annual escalation percentages combined with renewal clauses.
- 🛠️ **Repair Burden**: Broad tenant repair obligations combined with damage liability.
- 🚪 **Entry & Privacy**: Landlord entry rights evaluated for prior notice (e.g. 24 hours) or appointment requirements.

### 4. Early-Exit Financial Arithmetic & Slider
- Calculates exact exposure across all months in the lock-in period:
  $$\text{Remaining Months} = \max(\text{Lock-In Months} - \text{Leave After Months}, 0)$$
  $$\text{Exposure} = \text{Monthly Rent} \times \text{Remaining Months}$$
- Interactive frontend slider allows renters to see potential financial exposure dynamically (e.g. leaving after 4 months in a 6-month lock-in at ₹18,000/mo = **₹36,000**).
- Displays explicit assumptions and legal disclaimer wording: *"Potential financial exposure based only on the stated agreement terms."*

### 5. Neutrality & Language Guardrails
Strict rule engine prevents any legal advice or subjective judgements:
- **Restricted Terms:** `illegal`, `unlawful`, `void`, `valid`, `invalid`, `enforceable`, `unenforceable`, `risky`, `scam`, `trap`, `standard`, `market rate`, `you should sign`, `you should not sign`.
- If an LLM response contains restricted terms, the guardrail service automatically replaces the sentence with neutral templates (e.g. *"This clause is worth reading carefully. The original text is shown below."*).
- Verbatim quotes in evidence blocks are preserved.

### 6. Privacy-First PII Masking
Before text is analyzed by any external model, sensitive personal data is redacted into stable placeholders:
- Aadhaar Numbers $\rightarrow$ `[AADHAAR_REDACTED_1]`
- PAN Numbers $\rightarrow$ `[PAN_REDACTED_1]`
- Phone Numbers $\rightarrow$ `[PHONE_REDACTED_1]`
- Email Addresses $\rightarrow$ `[EMAIL_REDACTED_1]`
- *Rent amounts, deposit figures, and dates are preserved.*

### 7. Written-Agreement Tracker & Polite Message Generator
- Generates courteous, professional message drafts for landlords (e.g. *"Hi, before signing I wanted to check one thing about the lock-in..."*).
- Tracks question status in browser `localStorage`:
  `Not asked` $\rightarrow$ `Asked` $\rightarrow$ `Answered` $\rightarrow$ `Agreed in writing` $\rightarrow$ `Resolved`
- Displays reminder banners: *"A spoken answer isn't the same as a written one. Consider getting it in writing."*

### 8. Signing & Move-in Checklist
- **Before Signing:** Rent & payment date confirmation, deposit refund timeline in writing, lock-in terms, repair limits, signed copy retention.
- **Move-In Day (Collapsible):** Deposit payment receipt, date-stamped condition photos, utility meter readings (power, gas, water), furniture & appliance inventory record.

### 9. Native Print & Formatted Export
- One-click copy for clean Markdown/plain-text summaries.
- Clean print stylesheet for hardcopy or PDF export before meeting landlords.

---

## 🔬 Backend Pipeline Deep Dive

| Module | File | Purpose |
| :--- | :--- | :--- |
| **Config** | `app/config.py` | Environment variable management (`pydantic-settings`). |
| **Schemas** | `app/schemas.py` | Strict Pydantic v2 data contract (`FullAnalysisResponse`). |
| **Document Processing** | `app/services/document_service.py` | PDF parsing (`pymupdf`), Unicode text normalization, character limits. |
| **Privacy Redaction** | `app/services/privacy_service.py` | Regex-based PII masking (Aadhaar, PAN, Phone, Email). |
| **Clause Segmentation** | `app/services/clause_service.py` | Deterministic clause segmentation and offset indexing. |
| **LLM Service** | `app/services/llm_service.py` | Prompt construction, timeout/retry handling, JSON coercion. |
| **Evidence Validator** | `app/services/evidence_validator.py` | Exact matching, normalization, and fuzzy quote recovery. |
| **Guardrails** | `app/services/guardrail_service.py` | Neutrality enforcement and restricted word replacement. |
| **Rule Engine** | `app/services/rule_engine.py` | Keyword tagging, missing items detection, pattern recognition. |
| **Interaction Engine** | `app/services/interaction_engine.py` | Builds structured cross-clause interaction models. |
| **Calculation Service** | `app/services/calculation_service.py` | Python financial math and Indian currency formatting (`₹`). |
| **Consistency Service** | `app/services/consistency_service.py` | Internal conflict detector (notice periods, words vs figures). |
| **Personalization** | `app/services/personalization_service.py` | Dynamic re-ordering and context notes based on user role/stay. |
| **Action Engine** | `app/services/action_service.py` | Action plan items, landlord messages, and signing checklists. |
| **Analysis Orchestrator** | `app/services/analysis_service.py` | End-to-end pipeline orchestration and fallback handling. |

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

### 2. Sample Agreement
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

**Response (`200 OK`):**
```json
{
  "document": {
    "analysis_id": "a1b2c3d4e5f67890",
    "filename": "demo_agreement.txt",
    "clauses": [...]
  },
  "context_notes": [
    {
      "text": "Because you selected flexibility as your priority, related terms are highlighted first."
    }
  ],
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
  "missing": [...],
  "findings": [...],
  "interactions": [...],
  "inconsistencies": [...],
  "action_plan": [...],
  "checklist": [...],
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

## 🎨 Frontend Architecture & Adapter

The frontend is built with **TanStack Start (React 19)**, **TailwindCSS**, **Vite**, and **Radix UI**.

### Route Map
- `/` — **Landing Page**: Value proposition, feature highlights, and sample triggers.
- `/upload` — **Document Input**: Drag-and-drop PDF upload or raw text paste.
- `/context` — **Optional Context**: Renter role (student/professional), stay duration, and priority.
- `/reading` — **Progress Animation**: Visual pipeline stage progress bar and status checks.
- `/dashboard` — **Executive Summary**: Key terms, high-priority findings, and context banners.
- `/early-exit` — **Connected Clauses**: Interactive financial slider and interaction pattern cards.
- `/findings` — **Findings & Evidence**: Filterable findings linking directly to exact source text.
- `/action-plan` — **Landlord Question Tracker**: Status management and polite message copying.
- `/checklist` — **Signing & Move-in Checklist**: Multi-group persistent checklist.
- `/summary` — **Summary Export**: Print view, copyable formatted text, and final review.

### Adapter Boundary (`src/services/analysis-service.ts`)
Converts backend `FullAnalysisResponse` to UI types and provides resilient offline fallback handling.

---

## 📄 Benchmark Demo Agreement & Fixtures

The benchmark fixture located in `backend/sample/demo_agreement.txt` contains:
- **Rent:** `₹18,000` / month due by the 5th.
- **Deposit:** `₹50,000` with painting/cleaning deductions and **no refund timeline**.
- **Clause 4.2 (Lock-in):** 6-month lock-in requiring balance rent payment upon early exit.
- **Clause 7.1 (Notice):** 60-day notice requirement after lock-in.
- **Clause 9.3 (Inconsistency):** Deliberate conflicting clause stating 1 month's notice.
- **Repairs:** All repairs and damage liability placed on tenant.
- **Entry:** Landlord entry permitted at any time with no advance notice specified.
- **PII:** Synthetic Aadhaar, PAN, phone numbers, and emails for privacy validation.

Golden expectations are verified automatically against `backend/sample/demo_expected.json`.

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v18+ or v20+) and **npm**
- **Python** (v3.11, v3.12, v3.13, or v3.14)

### Backend Setup (FastAPI)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment and activate
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
# source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables (optional for local/demo mode)
cp .env.example .env

# 5. Start backend development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend runs at `http://localhost:8000`.*

### Frontend Setup (React + Vite)

```bash
# 1. From repository root, install dependencies
npm install

# 2. Start frontend development server
npm run dev
```
*Frontend runs at `http://localhost:5173` (or `http://localhost:3000`).*

---

## 🧪 Testing & Quality Assurance

The backend includes a comprehensive test suite executed with `pytest`:

```bash
cd backend
.venv\Scripts\pytest
```

### Test Coverage Highlights
- `test_health_and_sample.py`: Verifies `/health` and `/sample` endpoints.
- `test_evidence_validator.py`: Exact quote matching, curly-quote normalization, cross-clause quote remapping, and fuzzy sentence recovery.
- `test_guardrail_service.py`: Case-insensitive restricted word detection and neutral template substitution.
- `test_rule_and_interactions.py`: Validates all 5 interaction patterns, negative cases (e.g. entry with notice does not trigger `entry_privacy`), and missing item detectors.
- `test_calculations_and_numbers.py`: Indian number/currency parsing, formatters (`format_inr`), and month-by-month exposure calculation (₹36,000 at month 4).
- `test_consistency_and_privacy.py`: Multi-clause notice conflict detection and PII masking.
- `test_pipeline_integration.py`: End-to-end demo agreement verification against `demo_expected.json`, whole-response quote substring assertions, prompt injection defense, and input limits.

---

## 🔒 Security, Privacy & Compliance

- **No Data Retention by Default:** Uploaded documents are processed in memory and never stored in persistent databases.
- **Client-Side State Storage:** Action plan question statuses and checklist progress are stored locally in the renter's browser `localStorage`.
- **Zero Hallucination Tolerance:** Findings require verified textual quotes; otherwise they are automatically pruned.
- **Prompt Injection Defense:** Agreement text is strictly encapsulated inside `<agreement_clauses>` and treated solely as untrusted data.

---

## ⚖️ Disclaimer

**LeaseLens explains the document. It is not a law firm and does not provide legal advice.**  
All analysis, potential financial exposures, and summaries are based strictly on the text provided. For formal legal disputes, consultations with a qualified advocate are recommended.
