import os
from fastapi.testclient import TestClient
from app.main import app
import jwt

client = TestClient(app)


def test_me_unauthorized():
	resp = client.get("/api/me")
	assert resp.status_code == 401


def test_me_authorized_with_secret(monkeypatch):
	secret = "testsecret"
	monkeypatch.setenv("SUPABASE_JWT_SECRET", secret)
	# Recreate app dependency cache if needed (in this simple setup, dependency reads env on import)

	payload = {"sub": "user-123"}
	token = jwt.encode(payload, secret, algorithm="HS256")
	headers = {"Authorization": f"Bearer {token}"}

	resp = client.get("/api/me", headers=headers)
	assert resp.status_code == 200
	assert resp.json()["message"] == "user-123"