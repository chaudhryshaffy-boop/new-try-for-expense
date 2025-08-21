from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base


class Budget(Base):
	__tablename__ = "budgets"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(String, index=True, nullable=False)
	name = Column(String, nullable=False)
	# Month in format YYYY-MM
	month = Column(String, nullable=False)
	amount = Column(Numeric(14, 2), nullable=False)
	category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
	created_at = Column(DateTime(timezone=True), server_default=func.now())