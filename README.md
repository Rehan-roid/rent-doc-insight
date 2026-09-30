# LeaseLens

**Tagline:** Understand it. Question it. Get it in writing.

LeaseLens is an evidence-first AI assistant and document analysis system for rental agreements, specifically tailored for Indian residential leases, leave-and-license agreements, PG (paying guest) arrangements, and student housing.

---

## 🌟 Key Capabilities

1. **Plain-English Explanations:** Breaks down complex legal wording into clear terms and practical renter impacts.
2. **Strict Evidence Verification:** Every finding, key term, and interaction links back to the exact quote in the agreement. Unverifiable statements are dropped.
3. **5 Cross-Clause Interactions:** Deterministically detects interacting clauses that affect tenancy rights:
   - **Early Exit:** How lock-in duration, notice period, and termination penalties compound.
   - **Deposit Return:** Deductions combined with missing refund deadlines or inspection processes.
   - **Rent Growth:** Annual escalation percentages paired with renewal conditions.
   - **Repair Burden:** Broad maintenance obligations coupled with tenant damage liability.
   - **Entry & Privacy:** Landlord access rights evaluated for notice and appointment requirements.
4. **Interactive Early-Exit Financial Calculator:** Computes exact exposure across every month in the lock-in period (e.g. ₹36,000 at month 4 for the demo agreement).
5. **Guardrails & Language Control:** Pure neutrality — no legal advice, no benchmarking against outside practice, and strictly zero restricted words (`illegal`, `void`, `enforceable`, `standard`, `market rate`, etc.).
6. **Privacy-First Redaction:** Automatically masks Aadhaar, PAN, phone numbers, and emails with stable placeholders before processing.
7. **Action Plan & Written-Agreement Tracker:** Generates polite, ready-to-send messages for landlords and tracks statuses (`not_asked`, `asked`, `answered`, `agreed_in_writing`, `resolved`, `needs_professional`).
8. **Signing & Move-In Checklist:** Base legal confirmation steps plus derived action items and move-in condition records.

---

## 🏗️ Architecture

```text
               +-----------------------------------+
               |    LeaseLens Frontend (React)     |
               | (TanStack Start + Tailwind + UI)  |
               +-----------------+-----------------+
                                 |
                          analysisService
                                 |
                                 v
                    POST http://localhost:8000/analyze
                                 |
               +-----------------+-----------------+
               |     FastAPI Backend Pipeline      |
               +-----------------------------------+
                                 |
            1. Document Processing & Limits Validation
                                 |
            2. Privacy Redaction (Aadhaar, PAN, Phone, Email)
                                 |
            3. Deterministic Clause Segmentation (c1, c2, ...)
                                 |
            4. LLM Extraction & Lenient Coercion (or Deterministic Fallback)
                                 |
            5. Evidence Verification (Exact + Normalized + Fuzzy Recovery)
                                 |
            6. Guardrail Validation (Neutral Replacement of Restricted Terms)
                                 |
            7. Rule & Interaction Engine (5 Deterministic Patterns + Missing Items)
                                 |
            8. Python Financial Calculations (Early-Exit Slider Table)
                                 |
            9. Personalization & Context Ordering (Role, Stay, Priority)
                                 |
           10. Action Engine & Checklist Generator (Polite Messages + Stable IDs)
                                 |
                                 v
                     FullAnalysisResponse JSON
```

---

## 🚀 Quickstart & Running

### 1. Backend (FastAPI)

```bash
cd backend

# Create virtual environment and activate
python -m venv .venv
.venv\Scripts\activate      # On Windows
# source .venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start backend dev server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will run at: `http://localhost:8000`  
API Health check: `http://localhost:8000/health`  
Sample agreement: `http://localhost:8000/sample`

### 2. Frontend (React + Vite + TanStack)

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173` (or `http://localhost:3000`).

### 3. Running Backend Tests

```bash
cd backend
.venv\Scripts\pytest
```

---

## 🧪 Benchmark Demo Walkthrough

1. Click **Try sample agreement** (or paste/upload).
2. Review **Key Terms** (Rent ₹18,000, Deposit ₹50,000, Lock-in 6 months, Notice 60 days) and note the attention item on missing deposit refund timeline.
3. Open **If you need to leave early** and adjust the slider:
   - Month 4 exposure: **₹36,000** ("2 remaining months × ₹18,000").
4. Inspect the **Exact Evidence** panel for any finding to view the verified clause text.
5. Review the **Inconsistency Banner** noting the conflict between Clause 7.1 (60 days) and Clause 9.3 (1 month notice).
6. In **Action Plan**, copy the pre-drafted polite message for the landlord, change status to **Answered**, then **Agreed in writing**.
7. Complete the **Signing & Move-in Checklist**.
8. Go to **Summary** to copy or print the complete review.

---

## 📄 License & Disclaimer

This explains the document. It isn't legal advice.
