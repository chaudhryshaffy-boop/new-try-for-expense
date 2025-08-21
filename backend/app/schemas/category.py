from pydantic import BaseModel
from typing import Optional


class CategoryCreate(BaseModel):
	name: str
	type: str = "expense"
	parent_id: Optional[int] = None


class CategoryRead(BaseModel):
	id: int
	name: str
	type: str
	parent_id: Optional[int] = None

	class Config:
		from_attributes = True