from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class Account(Base):
	__tablename__ = "accounts"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(String, index=True, nullable=False)
	name = Column(String, nullable=False)
	type = Column(String, nullable=False, default="checking")
	currency = Column(String, nullable=False, default="USD")
	balance = Column(Numeric(14, 2), nullable=False, default=0)
	created_at = Column(DateTime(timezone=True), server_default=func.now())