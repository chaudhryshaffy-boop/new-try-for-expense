from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db_session
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountRead

router = APIRouter()


@router.get("/accounts", response_model=List[AccountRead])
def list_accounts(user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> List[AccountRead]:
	return db.query(Account).filter(Account.user_id == user_id).order_by(Account.name.asc()).all()


@router.post("/accounts", response_model=AccountRead)
def create_account(payload: AccountCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> AccountRead:
	item = Account(user_id=user_id, name=payload.name, type=payload.type, currency=payload.currency, balance=payload.balance)
	db.add(item)
	db.commit()
	db.refresh(item)
	return item