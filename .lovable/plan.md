# LeaseLens Frontend Demo

## Goal
Build a polished, responsive, frontend-only LeaseLens experience using typed local mock data and browser state. The complete demonstration will run without accounts, servers, document processing, databases, API calls, or AI integrations.

## Experience
- Create a warm off-white, deep navy, calm teal, soft green, amber, and muted purple design system with readable sans-serif typography, restrained borders, compact radii, and subtle motion.
- Add the minimal LeaseLens document/lens mark, shared navigation, disclaimer treatment, responsive app shell, toasts, status badges, empty states, and accessible controls.
- Build the landing page with the exact positioning and copy requested, including a realistic agreement preview rather than decorative artwork.
- Build the upload and paste-text paths, a document-focused progress screen, and the optional three-question renter context screen.
- Build the main dashboard with agreement status, key terms, finding counts, priority findings, and cross-clause patterns.
- Build dedicated Findings, Early Exit, Action Plan, Checklist, Privacy, and Saved Summary screens, each with unique page metadata.
- Implement the source-evidence side panel with clearly separated original text and LeaseLens explanation.

## Working Demo Flow
- Landing → upload/paste → timed mock reading → optional context → dashboard.
- Dashboard → Early Exit → source clauses → add question → Action Plan.
- Question statuses progress from Not asked through Resolved, with Accepted as-is and Get professional advice options.
- Checklist and action-plan progress persist locally in the browser.
- Saved Summary reflects current local progress and Print / Save opens the browser print dialog.
- All primary navigation and demonstration controls lead somewhere meaningful; no fake network activity is introduced.

## Technical Details
- Use TanStack Start’s file routes with React, TypeScript, Tailwind CSS v4, existing shadcn components, and Lucide icons.
- Keep a typed `AnalysisResponse` model with `key_terms`, `findings`, `interactions`, and `inconsistencies`, plus clearly labeled mock agreement data.
- Expose mock analysis through a frontend `analysisService` abstraction that resolves local data only and is designed for later replacement.
- Use shared feature components for the logo, navbar, upload area, context selector, cards, evidence sheet, stepper, checklist, loading, disclaimer, and status controls.
- Store only demo preferences, checklist state, action-plan state, and mock session state in localStorage.
- Add print-specific styling for the saved summary and reduced-motion handling.

## Validation
- Check all content routes for unique title, description, Open Graph, and Twitter metadata.
- Verify the complete flow at desktop and mobile widths, including overlays, text wrapping, keyboard-accessible controls, and absence of horizontal overflow.
- Confirm the latest preview build, runtime console, and main interactions are clean.
