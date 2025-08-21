from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base import Base


transaction_tags = Table(
	"transaction_tags",
	Base.metadata,
	Column("transaction_id", ForeignKey("transactions.id"), primary_key=True),
	Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)


class Transaction(Base):
	__tablename__ = "transactions"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(String, index=True, nullable=False)
	account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
	category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

	amount = Column(Numeric(14, 2), nullable=False)
	currency = Column(String, nullable=False, default="USD")
	date = Column(Date, nullable=False)
	merchant = Column(String, nullable=True)
	description = Column(String, nullable=True)

	account = relationship("Account")
	category = relationship("Category")
	tags = relationship("Tag", secondary=transaction_tags, back_populates="transactions")