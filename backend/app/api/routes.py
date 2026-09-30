"""API routes for LeaseLens — /health, /sample, /analyze."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from app.schemas import AnalyzeRequest, ErrorBody, ErrorResponse, FullAnalysisResponse, UserContext
from app.services.analysis_service import analyze_document
from app.services.document_service import DocumentProcessingError

router = APIRouter()

_SAMPLE_PATH = Path(__file__).resolve().parent.parent.parent / "sample" / "demo_agreement.txt"


@router.get("/health")
async def health_check():
    """Health check endpoint. Works without any LLM key."""
    return {"status": "ok"}


@router.get("/sample")
async def get_sample():
    """Return the benchmark demo rental agreement text."""
    if not _SAMPLE_PATH.exists():
        raise HTTPException(status_code=404, detail="Sample agreement not found")
    content = _SAMPLE_PATH.read_text(encoding="utf-8")
    return {
        "filename": "demo_agreement.txt",
        "text": content,
    }


@router.post("/analyze", response_model=FullAnalysisResponse)
async def analyze(
    request: Request,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    context: Optional[str] = Form(None),
):
    """Analyze a rental agreement (PDF file upload or raw text) with optional user context."""
    content_type = request.headers.get("content-type", "")

    user_ctx = UserContext()
    raw_text: Optional[str] = None
    pdf_bytes: Optional[bytes] = None
    filename: Optional[str] = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            raw_text = body.get("text", "")
            ctx_data = body.get("context", {})
            if isinstance(ctx_data, dict):
                user_ctx = UserContext.model_validate(ctx_data)
        except Exception as e:
            return JSONResponse(
                status_code=400,
                content={"error": {"code": "invalid_request", "message": f"Invalid JSON payload: {e}"}},
            )
    else:
        # Multipart form-data
        if file is not None:
            filename = file.filename
            pdf_bytes = await file.read()
        elif text:
            raw_text = text

        if context:
            try:
                parsed_ctx = json.loads(context)
                if isinstance(parsed_ctx, dict):
                    user_ctx = UserContext.model_validate(parsed_ctx)
            except Exception:
                user_ctx = UserContext()

    if not raw_text and not pdf_bytes:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "empty_text", "message": "Please paste agreement text or upload a PDF."}},
        )

    try:
        response = await analyze_document(
            raw_text=raw_text,
            pdf_bytes=pdf_bytes,
            filename=filename,
            context=user_ctx,
        )
        return response
    except DocumentProcessingError as exc:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": exc.code, "message": exc.message}},
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "internal_error", "message": "An unexpected error occurred during analysis."}},
        )
