from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List


class TransactionBase(BaseModel):
	amount: float
	currency: str = "USD"
	date: date
	merchant: Optional[str] = None
	description: Optional[str] = None
	account_id: Optional[int] = None
	category_id: Optional[int] = None
	tag_ids: List[int] = Field(default_factory=list)


class TransactionCreate(TransactionBase):
	pass


class TransactionUpdate(BaseModel):
	amount: Optional[float] = None
	currency: Optional[str] = None
	date: Optional[date] = None
	merchant: Optional[str] = None
	description: Optional[str] = None
	account_id: Optional[int] = None
	category_id: Optional[int] = None
	tag_ids: Optional[List[int]] = None


class TransactionRead(TransactionBase):
	id: int
	user_id: str

	class Config:
		from_attributes = True