from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.api.deps import get_current_user, get_db_session
from app.schemas.transaction import TransactionRead, TransactionCreate, TransactionUpdate
from app.models.transaction import Transaction
from app.models.tag import Tag

router = APIRouter()


@router.get("/transactions", response_model=List[TransactionRead])
def list_transactions(
	user_id: str = Depends(get_current_user),
	db: Session = Depends(get_db_session),
	start_date: Optional[date] = Query(None),
	end_date: Optional[date] = Query(None),
	category_id: Optional[int] = Query(None),
	search: Optional[str] = Query(None),
	limit: int = Query(200, ge=1, le=1000),
	offset: int = Query(0, ge=0),
) -> List[TransactionRead]:
	q = db.query(Transaction).filter(Transaction.user_id == user_id)
	if start_date:
		q = q.filter(Transaction.date >= start_date)
	if end_date:
		q = q.filter(Transaction.date <= end_date)
	if category_id:
		q = q.filter(Transaction.category_id == category_id)
	if search:
		pattern = f"%{search}%"
		q = q.filter((Transaction.merchant.ilike(pattern)) | (Transaction.description.ilike(pattern)))
	items = q.order_by(Transaction.date.desc(), Transaction.id.desc()).offset(offset).limit(limit).all()
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


@router.put("/transactions/{transaction_id}", response_model=TransactionRead)
def update_transaction(
	transaction_id: int,
	payload: TransactionUpdate,
	user_id: str = Depends(get_current_user),
	db: Session = Depends(get_db_session),
) -> TransactionRead:
	item = db.query(Transaction).filter(Transaction.user_id == user_id, Transaction.id == transaction_id).first()
	if not item:
		raise HTTPException(status_code=404, detail="Transaction not found")
	for field, value in payload.dict(exclude_unset=True).items():
		if field == 'tag_ids' and value is not None:
			tags = db.query(Tag).filter(Tag.id.in_(value), Tag.user_id == user_id).all()
			setattr(item, 'tags', tags)
		else:
			setattr(item, field, value)
	db.add(item)
	db.commit()
	db.refresh(item)
	return item


@router.delete("/transactions/{transaction_id}")
def delete_transaction(
	transaction_id: int,
	user_id: str = Depends(get_current_user),
	db: Session = Depends(get_db_session),
) -> dict:
	item = db.query(Transaction).filter(Transaction.user_id == user_id, Transaction.id == transaction_id).first()
	if not item:
		raise HTTPException(status_code=404, detail="Transaction not found")
	db.delete(item)
	db.commit()
	return {"ok": True}