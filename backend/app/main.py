from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health as health_router
from app.api.routes import me as me_router
from app.api.routes import transactions as transactions_router
from app.db.session import engine
from app.db.base import Base
from app import models  # ensure models are imported

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
	CORSMiddleware,
	allow_origins=[*settings.BACKEND_CORS_ORIGINS, "*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(health_router.router, prefix=settings.API_V1_PREFIX, tags=["health"])
app.include_router(me_router.router, prefix=settings.API_V1_PREFIX, tags=["auth"])
app.include_router(transactions_router.router, prefix=settings.API_V1_PREFIX, tags=["transactions"])


@app.on_event("startup")
def on_startup() -> None:
	# For local/dev bootstrap, ensure tables exist. In production use Alembic.
	Base.metadata.create_all(bind=engine)