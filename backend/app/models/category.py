from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Category(Base):
	__tablename__ = "categories"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(String, index=True, nullable=False)
	name = Column(String, nullable=False)
	type = Column(String, nullable=False, default="expense")
	parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

	parent = relationship("Category", remote_side=[id], backref="children")