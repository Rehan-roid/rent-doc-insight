# LeaseLens Clarity UI

Build ONLY the frontend/UI for a web application called LeaseLens.

Tagline:
Understand it. Question it. Get it in writing.

Product:
LeaseLens is a rental-agreement explainer designed for first-time renters, students, and PG residents. It helps users understand what their agreement says, identify clauses worth discussing or clarifying, see the exact source text, and turn those findings into questions.

🚨 VERY IMPORTANT — SCOPE

This task is FRONTEND/UI ONLY.

DO NOT:

Build a backend

Build FastAPI

Build APIs

Connect to an LLM

Add OpenAI/Anthropic/DeepSeek/Gemini APIs

Add Supabase

Add a database

Add authentication

Add real PDF processing

Add OCR

Add real AI analysis

Create server-side functions

Create fake API endpoints

Put API keys anywhere

Spend time implementing business logic

The backend and AI analysis will be developed separately and connected later.

For now, use local mock data and frontend state only so every screen can be demonstrated smoothly.

The most important goal is a polished, believable frontend that looks like a real product rather than an AI-generated template.

1. DESIGN DIRECTION

The UI should feel:

Calm

Trustworthy

Human

Modern

Professional

Approachable

Positive

Clean

Slightly premium

It should NOT feel like:

A generic AI dashboard

A futuristic cyberpunk AI product

A ChatGPT clone

A neon SaaS template

An overly glassmorphic website

A template with excessive gradients

An interface full of floating cards

An AI-generated Dribbble concept

Visual philosophy

Think:

Modern fintech + thoughtful productivity app + trustworthy legal/document tool

The user is dealing with an important rental agreement, so the interface should reduce anxiety rather than create it.

Use plenty of whitespace, strong typography, restrained colors, subtle borders and small amounts of color for meaning.

2. COLOR SYSTEM

Use a light theme as the primary experience.

Background:

Warm off-white / very light neutral

Avoid pure white everywhere

Primary:

Deep navy / dark blue

Secondary accent:

Calm teal or muted green

Positive:

Soft green

Attention:

Warm amber

Professional advice:

Muted purple

Avoid:

Neon cyan

Neon purple

Excessive blue-purple gradients

Bright red everywhere

Heavy black backgrounds

The overall color palette should feel natural and trustworthy.

Color should communicate meaning:

Green → understood / confirmed

Amber → discuss / clarify

Purple → professional advice

Red should be used very sparingly, only where genuinely necessary.

3. TYPOGRAPHY

Typography is extremely important.

Use a clean modern sans-serif such as:

Inter

or another highly readable professional sans-serif.

Use:

Strong hierarchy

Medium/bold headings

Comfortable paragraph spacing

Short readable text blocks

Do NOT use:

Futuristic fonts

Monospace fonts for normal UI

Oversized marketing typography everywhere

Excessive uppercase text

The UI should look like something a real startup designer made.

4. BRANDING

Application name:

LeaseLens

Do NOT use:

RentReady

LegalAI

LeaseGPT

ContractAI

Any other AI-sounding name

Logo should be extremely simple.

Create a small abstract icon combining:

A document/page

A subtle lens/check concept

Keep it minimal.

The brand should still look good if the icon is removed and only "LeaseLens" remains.

5. LANDING PAGE

Create a polished landing page.

Top navigation:

LeaseLens logo

Navigation:

How it works

What you get

Privacy

Right side:
Start with your agreement →

Hero section:

Small eyebrow:
RENTAL AGREEMENT CLARITY

Main heading:

Know what you're signing before you sign it.

Supporting text:

"LeaseLens turns complicated rental agreements into clear terms, questions, and evidence you can actually use."

Primary CTA:

Upload agreement

Secondary CTA:

Paste text

Under the buttons:

"Your document stays private during this demo."

Also display the guardrail subtly:

This explains the document. It isn't legal advice.

6. LANDING PAGE VISUAL

Do NOT create a giant AI illustration.

Instead create a realistic product preview on the right side.

Show a clean rental agreement interface with:

Monthly Rent
₹18,000

Deposit
₹50,000

Lock-in
6 months

Notice
60 days

Then a small finding:

"Deposit refund timeline isn't specified."

And a button:

"Add question"

This should look like an actual product screenshot, not an AI illustration.

7. UPLOAD EXPERIENCE

When clicking Upload Agreement, show a polished upload screen.

Heading:

Let's look through your agreement.

Large upload area:

Drag & drop your PDF here

or

Choose PDF

Below:

"PDFs up to 10 MB"

Also provide:

Paste agreement text instead

The upload component should feel simple and reassuring.

Do not create real PDF processing.

For the demo, selecting/uploading can transition to the mock analysis state or dashboard.

8. ANALYSIS LOADING SCREEN

Create a beautiful but simple loading state.

Heading:

Reading your agreement

Progress steps:

✓ Finding key terms
✓ Connecting related clauses
○ Preparing questions
○ Building your checklist

Use subtle animation.

Do NOT make it look like an AI chatbot.

No:
"AI is thinking..."
"Neural network processing..."
"Agents collaborating..."

Keep it human and document-focused.

After a short frontend-only delay, transition to the dashboard.

9. DASHBOARD

This is the main product screen.

Top:

LeaseLens

Agreement:
Flat Rental Agreement.pdf

Small status:

Analysis complete

Then:

Heading:

Here's what we found

Supporting text:

"Start with the items you may want to discuss before signing."

10. KEY TERMS

Create a clean horizontal/vertical group of key-term cards.

Cards:

Monthly Rent
₹18,000

Security Deposit
₹50,000

Lock-in
6 months

Notice Period
60 days

Repairs
Tenant + landlord

Deposit refund
Not specified

The "Not specified" state should visually stand out without looking dangerous.

Example:

Deposit refund
Not specified

Small text:

"Ask when and how the deposit will be returned."

11. FINDING SUMMARY

Show a simple summary row:

3
Discuss

2
Clarify

4
Understood

Do not call these:

Risk scores
Risk percentages
Legal scores
Danger scores

There should be NO numerical legal-risk scoring.

12. FINDINGS SCREEN

Create a dedicated findings page.

Header:

Things worth a closer look

Tabs/filters:

All
Discuss
Clarify
Understood

Each finding should be presented as a clean card.

Example:

Early exit terms

DISCUSS

"Your agreement combines a 6-month lock-in with a 60-day notice period and an early termination condition."

Below:

Why this matters

"If you need to leave during the lock-in period, the agreement may create an additional financial obligation."

Then:

Source

Show a small quoted section of the original agreement.

Example:

"Tenant shall remain committed for a minimum period of six months..."

Button:

View in agreement

Secondary:

Add question

13. EXACT EVIDENCE

This is one of the most important parts of the UI.

When clicking "View in agreement", open a side panel or modal.

Title:

Where this came from

Show:

Clause 7 — Term & Termination

Then display the original agreement text.

Highlight the exact relevant sentence.

Beside it show:

LeaseLens explanation

"The agreement sets a minimum stay and separately mentions notice requirements."

Make it visually obvious that:

LEFT = original document

RIGHT = explanation

Never visually mix AI-generated text with the original clause.

Add a small label:

Original agreement

14. KILLER CROSS-CLAUSE SCREEN

Create a special page/screen called:

Early Exit

Subtitle:

Three clauses that matter together

Display three connected sections:

LOCK-IN
6 months

↓

NOTICE
60 days

↓

EARLY TERMINATION
Additional payment mentioned

Then:

What this means in practice

"These clauses should be read together. Leaving before the lock-in ends may have consequences beyond simply giving notice."

Then show:

Potential financial exposure

₹36,000

Small disclaimer:

"Illustrative calculation based only on the stated agreement terms."

Do not imply that this is a legal penalty or guaranteed amount.

Then:

Ask before signing

"Does the early termination clause apply during the full lock-in period, and exactly what payment would be due if I leave early?"

Buttons:

Add to action plan

View source clauses

Add:

May need professional advice

where appropriate.

Persistent footer/label:

This explains the document. It isn't legal advice.

15. OTHER CROSS-CLAUSE PATTERNS

Create UI support for these patterns even if only one is demonstrated prominently:

Early Exit
Lock-in + Notice + Early Termination

Deposit Return
Deposit + Deductions + Refund Timing + Inspection

Rent Growth
Rent Escalation + Renewal + New Rent

Repair Burden
Maintenance + Repairs + Damage Liability

Entry & Privacy
Landlord Entry + Notice/Permission

These should appear as cards/list items in the interface.

Example:

Deposit Return

Deposit deductions are mentioned, but the agreement doesn't clearly state when the remaining amount will be returned.

Button:

Review

16. ACTION PLAN

Create a dedicated page:

Your action plan

Subtitle:

"Turn unclear terms into questions before you sign."

Sections:

DISCUSS

Card:
Early exit terms

Question:
"Can we clarify what happens financially if I leave during the lock-in period?"

Status:

Not asked

Button:
Mark as asked

CLARIFY

Card:
Deposit refund

Question:
"When will the remaining security deposit be returned after moving out?"

Status:
Not asked

CONFIRM

Card:
Repairs

Question:
"Can we confirm which repairs are the tenant's responsibility?"

17. QUESTION TRACKER

Each question should support a simple status progression:

Not asked
↓
Asked
↓
Answered
↓
Agreed in writing
↓
Resolved

Also provide:

Accepted as-is

and

Get professional advice

Make this interaction extremely simple.

18. TENANT CONTEXT

Before the dashboard, optionally show a small context screen.

Heading:

A little context helps us organize your results.

Question 1:

I am:

Student
Working professional

Question 2:

Expected stay:

Under 6 months
6–12 months
1+ year

Question 3:

What matters most?

Flexibility
Deposit
Cost
Maintenance

Do not make this feel like a long form.

Maximum 3 questions.

Show:

Skip for now

Important:

Context should only change the ORDER or emphasis of findings.

It must never:

Hide findings

Change legal meaning

Change severity

Create a legal recommendation

19. CHECKLIST

Create:

Before you sign

Checklist items:

□ Confirm rent and payment date

□ Confirm deposit amount

□ Ask about deposit refund timeline

□ Clarify lock-in and early exit

□ Confirm notice period

□ Confirm repair responsibilities

□ Get important changes in writing

□ Keep a copy of the signed agreement

Allow checkboxes to persist using frontend local state/localStorage.

20. SAVED SUMMARY

Create a page:

Your saved summary

Show:

Agreement name

Key terms

Discuss

Clarify

Questions

Checklist progress

Button:

Print / Save summary

This can simply trigger a browser print dialog.

Do not build a backend PDF generator.

21. PRIVACY UI

Create a small Privacy section.

Keep the language simple:

Your agreement is yours.

"LeaseLens is designed to minimize unnecessary personal information in the document."

Show:

✓ Personal details can be redacted before analysis

✓ Original clauses remain distinguishable from explanations

✓ No account is required for the demo

Do not make unsupported claims about actual server-side deletion because there is no backend yet.

22. RESPONSIVE DESIGN

The application must work well on:

Desktop

Laptop

Tablet

Mobile

Desktop should feel spacious.

Mobile should stack cards naturally.

No horizontal overflow.

23. COMPONENTS

Build reusable components:

Navbar

Logo

Button

UploadDropzone

ContextSelector

KeyTermCard

FindingCard

EvidencePanel

InteractionCard

QuestionCard

StatusBadge

ChecklistItem

ProgressStepper

DisclaimerBanner

EmptyState

LoadingState

Toast

Modal / Sheet

Use consistent spacing and typography.

24. MOCK DATA

Create realistic frontend-only mock agreement data.

Use:

Monthly Rent: ₹18,000
Deposit: ₹50,000
Lock-in: 6 months
Notice Period: 60 days
Maintenance: Shared
Deposit refund timeline: Not specified

Include mock clauses for:

Lock-in

Notice

Early termination

Deposit

Repairs

Rent escalation

Landlord entry

These are ONLY demo data.

Make it very clear in code that this is mock data to be replaced by the backend later.

25. FRONTEND ARCHITECTURE

Use:

React
TypeScript
Vite
Tailwind CSS
shadcn/ui
Lucide icons

Use clean component structure.

Suggested structure:

src/
components/
pages/
components/ui/
data/
hooks/
types/
lib/

Keep analysis data in a typed frontend mock object.

Create TypeScript interfaces matching this future backend response:

key_terms
findings
interactions
inconsistencies

Do not implement the backend.

26. FUTURE BACKEND PLACEHOLDER

Design the frontend so the future backend can easily replace the mock data.

Create one clear abstraction such as:

analysisService

For now it returns mock data.

Later it can call:

POST /analyze

Do NOT actually create this endpoint.

Do NOT implement fetch calls to a nonexistent backend.

27. INTERACTION & ANIMATION

Use subtle animations only.

Examples:

Page fade/slide

Card hover

Progress animation

Checkbox transition

Side panel opening

Keep animations fast and professional.

Avoid:

Floating blobs

Constant moving gradients

Excessive parallax

Particle effects

3D objects

Glowing borders

The product should feel calm.

28. IMPORTANT UI COPY RULES

Use natural human language.

Prefer:

"Worth clarifying"

"Ask before signing"

"Not specified"

"Here's where it appears"

"What this means in practice"

"Get it in writing"

Avoid:

"AI-powered legal intelligence"

"Advanced neural analysis"

"Legal risk score"

"AI confidence score"

"100% accurate"

"Guaranteed protection"

"Legally safe"

"You're protected"

"Illegal"

"Definitely invalid"

The product explains documents; it does not act as a lawyer.

29. MOST IMPORTANT SCREEN HIERARCHY

Spend the most design effort on these:

Dashboard

Early Exit cross-clause screen

Evidence/source panel

Action Plan

Landing page

These are the screens that will be demonstrated.

30. DEMO FLOW

The frontend should support this complete demo flow:

Landing
→ Upload Agreement
→ Loading
→ Optional Context
→ Dashboard
→ Early Exit interaction
→ View exact source clauses
→ Add question
→ Action Plan
→ Mark Asked
→ Mark Agreed in writing
→ Checklist
→ Saved Summary

Everything should work using frontend mock data.

There must be NO dead buttons in the main demo flow.

31. FINAL QUALITY BAR

Before finishing, check:

No backend

No API

No API keys

No database

No authentication

No AI integration

No fake network requests

No broken navigation

No dead buttons in demo flow

Responsive layout

Consistent typography

Consistent spacing

Accessible buttons

Good loading state

Good empty/error states

Natural copy

No generic AI-dashboard aesthetic

Most importantly:

It must look like a real product designed for renters, not a UI generated by an AI coding tool.

Do not keep adding features.

Do not redesign the product concept.

Do not change the product name.

Do not add backend functionality.

Focus entirely on producing a polished, trustworthy, human-looking frontend for LeaseLens.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ddc89c1-9789-4ba1-b519-abc9e29e3606).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
