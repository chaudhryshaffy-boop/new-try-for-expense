from pydantic import BaseModel
from typing import Optional


class AccountBase(BaseModel):
	name: str
	type: str = "checking"
	currency: str = "USD"
	balance: float = 0.0


class AccountCreate(AccountBase):
	pass


class AccountRead(AccountBase):
	id: int
	user_id: str

	class Config:
		from_attributes = True