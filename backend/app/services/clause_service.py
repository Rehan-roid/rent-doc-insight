"""Clause segmentation service — deterministic IDs and offsets."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Optional

from app.schemas import Clause

# ---------------------------------------------------------------------------
# Heading patterns — ordered from most to least specific
# ---------------------------------------------------------------------------

_NUMBERED_HEADING = re.compile(
    r"^(\d{1,2}(?:\.\d{1,2})*)[.)]\s+(.+)?$",
    re.MULTILINE,
)

_CLAUSE_HEADING = re.compile(
    r"^(?:Clause|CLAUSE|Article|ARTICLE|Section|SECTION)\s+(\d{1,2}(?:\.\d{1,2})*)[.):\s]",
    re.MULTILINE,
)

_ALPHA_SUB = re.compile(
    r"^\(([a-z])\)\s+(.+)?$",
    re.MULTILINE,
)


def _make_id(label: str) -> str:
    """Convert a label like '3.1' or '(a)' to a stable id like 'c3_1' or 'c_a'."""
    label = label.strip().strip("()")
    return "c" + re.sub(r"[^a-zA-Z0-9]", "_", label)


def _extract_title(text: str) -> Optional[str]:
    """Try to pull a title from the first line of a clause body."""
    first_line = text.strip().split("\n")[0].strip()
    # If it's short and ALL CAPS or Title Case, treat as title
    if len(first_line) <= 60 and (first_line.isupper() or first_line.istitle()):
        return first_line
    return None


@dataclass
class _Segment:
    label: str
    start: int
    end: int
    text: str = ""
    parent_label: Optional[str] = None


def segment(original_text: str) -> list[Clause]:
    """
    Split original_text into clauses with stable IDs and offsets.
    Returns a list of Clause objects.
    """
    # Try numbered headings first
    matches = list(_NUMBERED_HEADING.finditer(original_text))
    if not matches:
        matches = list(_CLAUSE_HEADING.finditer(original_text))

    if matches:
        return _build_from_matches(matches, original_text)

    # Fallback: blank-line paragraphs
    return _segment_by_paragraphs(original_text)


def _build_from_matches(
    matches: list[re.Match],
    text: str,
) -> list[Clause]:
    clauses: list[Clause] = []
    used_ids: set[str] = set()

    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()

        # Extract numeric label from match
        label_raw = m.group(1) if m.lastindex and m.lastindex >= 1 else str(i + 1)
        clause_id = _make_id(label_raw)

        # Handle duplicate IDs
        orig_id = clause_id
        suffix = 2
        while clause_id in used_ids:
            clause_id = f"{orig_id}_{suffix}"
            suffix += 1
        used_ids.add(clause_id)

        # Skip bare heading fragments (very short body)
        if len(body) < 25 and i + 1 < len(matches):
            continue

        title = _extract_title(body)
        clauses.append(
            Clause(
                id=clause_id,
                label=label_raw,
                title=title,
                text=body,
                start=start,
                end=end,
            )
        )

    if not clauses:
        return _segment_by_paragraphs(text)
    return clauses


def _segment_by_paragraphs(text: str) -> list[Clause]:
    """Fallback: split on double newlines."""
    paras = re.split(r"\n{2,}", text)
    clauses: list[Clause] = []
    offset = 0

    for i, para in enumerate(paras):
        para = para.strip()
        if not para or len(para) < 25:
            offset += len(para) + 2
            continue
        label = str(i + 1)
        clause_id = f"c{i + 1}"
        start = text.find(para, offset)
        end = start + len(para)
        offset = end
        title = _extract_title(para)
        clauses.append(
            Clause(
                id=clause_id,
                label=label,
                title=title,
                text=para,
                start=start,
                end=end,
            )
        )
    return clauses
