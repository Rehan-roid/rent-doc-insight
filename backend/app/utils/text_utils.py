"""Text normalization utilities."""
from __future__ import annotations

import re
import unicodedata


def normalize_text(text: str) -> str:
    """Normalize Unicode quotes, dashes, whitespace, and hyphenated line breaks."""
    # Normalize Unicode
    text = unicodedata.normalize("NFC", text)
    # Curly quotes → straight
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    # Em/en dashes → hyphen
    text = text.replace("\u2014", "-").replace("\u2013", "-")
    # Hyphenated line breaks
    text = re.sub(r"-\n\s*", "", text)
    # Collapse multiple spaces / normalize line endings
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_for_comparison(text: str) -> str:
    """Normalize text for quote comparison only (not display)."""
    text = normalize_text(text)
    # Collapse all whitespace to single space, lowercase
    text = re.sub(r"\s+", " ", text).lower()
    # Strip surrounding quote marks and ellipses
    text = text.strip("\"''\u201c\u201d\u2018\u2019\u2026.")
    return text.strip()
