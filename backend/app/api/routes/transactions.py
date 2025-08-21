from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_current_user, get_db_session
from app.schemas.transaction import TransactionRead, TransactionCreate
from app.models.transaction import Transaction
from app.models.tag import Tag

router = APIRouter()


@router.get("/transactions", response_model=List[TransactionRead])
def list_transactions(
	user_id: str = Depends(get_current_user),
	db: Session = Depends(get_db_session),
) -> List[TransactionRead]:
	items = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.date.desc()).limit(200).all()
	return items


@router.post("/transactions", response_model=TransactionRead)
def create_transaction(
	payload: TransactionCreate,
	user_id: str = Depends(get_current_user),
	db: Session = Depends(get_db_session),
) -> TransactionRead:
	item = Transaction(
		user_id=user_id,
		amount=payload.amount,
		currency=payload.currency,
		date=payload.date,
		merchant=payload.merchant,
		description=payload.description,
		account_id=payload.account_id,
		category_id=payload.category_id,
	)
	if payload.tag_ids:
		tags = db.query(Tag).filter(Tag.id.in_(payload.tag_ids), Tag.user_id == user_id).all()
		item.tags = tags
	db.add(item)
	db.commit()
	db.refresh(item)
	return item