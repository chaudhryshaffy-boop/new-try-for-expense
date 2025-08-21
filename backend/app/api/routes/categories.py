from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db_session
from app.models.category import Category
from app.schemas.category import CategoryRead, CategoryCreate

router = APIRouter()


@router.get("/categories", response_model=List[CategoryRead])
def list_categories(user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> List[CategoryRead]:
	items = db.query(Category).filter(Category.user_id == user_id).order_by(Category.name.asc()).all()
	return items


@router.post("/categories", response_model=CategoryRead)
def create_category(payload: CategoryCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> CategoryRead:
	item = Category(user_id=user_id, name=payload.name, type=payload.type, parent_id=payload.parent_id)
	db.add(item)
	db.commit()
	db.refresh(item)
	return item