from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .base import Base
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db() -> Session:
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()