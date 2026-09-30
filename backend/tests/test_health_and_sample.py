"""Test health and sample endpoints."""
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_sample_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/sample")
        assert resp.status_code == 200
        data = resp.json()
        assert data["filename"] == "demo_agreement.txt"
        assert "LEAVE AND LICENSE AGREEMENT" in data["text"]
        assert "Clause 4.2" in data["text"]
        assert "Clause 7.1" in data["text"]
        assert "Clause 9.3" in data["text"]
