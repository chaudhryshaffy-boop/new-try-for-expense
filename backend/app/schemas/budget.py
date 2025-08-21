from pydantic import BaseModel
from typing import Optional


class BudgetBase(BaseModel):
	name: str
	month: str  # YYYY-MM
	amount: float
	category_id: Optional[int] = None


class BudgetCreate(BudgetBase):
	pass


class BudgetUpdate(BaseModel):
	name: Optional[str] = None
	month: Optional[str] = None
	amount: Optional[float] = None
	category_id: Optional[int] = None


class BudgetRead(BudgetBase):
	id: int
	user_id: str

	class Config:
		from_attributes = True


class BudgetWithProgress(BudgetRead):
	spent: float
	remaining: float
	progress: float  # 0..1
	status: str  # ok, warning, critical