from pydantic import BaseModel
from typing import Optional


class CategoryRead(BaseModel):
	id: int
	name: str
	type: str
	parent_id: Optional[int] = None

	class Config:
		from_attributes = True