"""Document processing service — text extraction, normalization, limits."""
from __future__ import annotations

import hashlib
import io
from typing import Optional

from app.config import settings
from app.utils.text_utils import normalize_text


class DocumentProcessingError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def process_text(raw: str) -> tuple[str, str]:
    """
    Normalize raw pasted text.
    Returns (normalized_text, analysis_id).
    Raises DocumentProcessingError on limit violations.
    """
    if not raw or not raw.strip():
        raise DocumentProcessingError("empty_text", "Please paste some agreement text to analyze.")

    normalized = normalize_text(raw)

    if len(normalized) > settings.max_text_chars:
        raise DocumentProcessingError(
            "text_too_long",
            f"The text is over {settings.max_text_chars:,} characters. "
            "Please paste a shorter section or upload a PDF.",
        )

    analysis_id = hashlib.sha256(normalized.encode()).hexdigest()[:16]
    return normalized, analysis_id


def process_pdf(content: bytes, filename: Optional[str] = None) -> tuple[str, str, int]:
    """
    Extract text from PDF bytes.
    Returns (normalized_text, analysis_id, page_count).
    Raises DocumentProcessingError on failures.
    """
    try:
        import fitz  # PyMuPDF
    except ImportError as exc:
        raise DocumentProcessingError(
            "internal_error",
            "PDF processing is not available. Please paste the agreement text.",
        ) from exc

    # Verify PDF header
    if not content[:5] == b"%PDF-":
        raise DocumentProcessingError(
            "invalid_pdf",
            "This file doesn't appear to be a valid PDF. Please upload a PDF or paste the text.",
        )

    # Size limit
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.max_upload_mb:
        raise DocumentProcessingError(
            "file_too_large",
            f"File is {size_mb:.1f} MB. Maximum allowed is {settings.max_upload_mb} MB.",
        )

    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        raise DocumentProcessingError(
            "invalid_pdf",
            "Could not open the PDF. It may be corrupt or password-protected.",
        ) from exc

    if doc.needs_pass:
        doc.close()
        raise DocumentProcessingError(
            "invalid_pdf",
            "This PDF is password-protected. Please remove the password and try again.",
        )

    page_count = len(doc)
    if page_count > settings.max_pdf_pages:
        doc.close()
        raise DocumentProcessingError(
            "too_many_pages",
            f"This PDF has {page_count} pages. Maximum allowed is {settings.max_pdf_pages}.",
        )

    pages_text: list[str] = []
    for page in doc:
        pages_text.append(page.get_text())  # type: ignore[attr-defined]
    doc.close()

    raw = "\n\n".join(pages_text)

    # Scanned PDF detection
    if page_count > 1 and len(raw.strip()) < 200:
        raise DocumentProcessingError(
            "scanned_pdf",
            "This PDF appears to contain scanned images rather than selectable text. "
            "Please paste the agreement text or use OCR if available.",
        )

    if not raw.strip():
        raise DocumentProcessingError(
            "empty_text",
            "No text could be extracted from this PDF. Please paste the agreement text.",
        )

    normalized = normalize_text(raw)

    if len(normalized) > settings.max_text_chars:
        raise DocumentProcessingError(
            "text_too_long",
            f"The extracted text is over {settings.max_text_chars:,} characters. "
            "Please upload a shorter document.",
        )

    analysis_id = hashlib.sha256(normalized.encode()).hexdigest()[:16]
    return normalized, analysis_id, page_count
