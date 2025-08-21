from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
import jwt
import httpx
from functools import lru_cache
from typing import Any, Dict, Optional
import os


security = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _fetch_jwks() -> Optional[Dict[str, Any]]:
	if not settings.SUPABASE_JWKS_URL:
		return None
	resp = httpx.get(settings.SUPABASE_JWKS_URL, timeout=5.0)
	resp.raise_for_status()
	return resp.json()


def _decode_with_jwks(token: str) -> Optional[Dict[str, Any]]:
	jwks = _fetch_jwks()
	if not jwks:
		return None
	for jwk in jwks.get("keys", []):
		try:
			public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
			payload = jwt.decode(token, public_key, algorithms=[jwk.get("alg", "RS256")], audience=None, options={"verify_aud": False})
			return payload
		except Exception:
			continue
	return None


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> str:
	if credentials is None:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
	token = credentials.credentials
	payload: Optional[Dict[str, Any]] = None
	# Try JWKS first
	payload = _decode_with_jwks(token)
	# Fallback to symmetric secret (read at call-time to support dynamic env in tests)
	if payload is None:
		secret = os.getenv("SUPABASE_JWT_SECRET", settings.SUPABASE_JWT_SECRET or "")
		if secret:
			try:
				payload = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False})
			except jwt.PyJWTError:
				pass
	if payload is None:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
	user_id = str(payload.get("sub"))
	if not user_id:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
	return user_id


DbSession = Session


def get_db_session(db: Session = Depends(get_db)) -> DbSession:
	return db