from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date
from app.api.deps import get_current_user, get_db_session
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetUpdate, BudgetWithProgress

router = APIRouter()


def _month_bounds(ym: str) -> tuple[date, date]:
	year, month = ym.split("-")
	year_i = int(year)
	month_i = int(month)
	start = date(year_i, month_i, 1)
	# next month start
	if month_i == 12:
		next_start = date(year_i + 1, 1, 1)
	else:
		next_start = date(year_i, month_i + 1, 1)
	end = next_start
	return start, end


def _progress_for_budget(db: Session, user_id: str, b: Budget) -> tuple[float, float, float, str]:
	start, end = _month_bounds(b.month)
	q = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
		Transaction.user_id == user_id,
		Transaction.date >= start,
		Transaction.date < end,
		Transaction.amount < 0,
	)
	if b.category_id:
		q = q.filter(Transaction.category_id == b.category_id)
	spent = float(-(q.scalar() or 0))
	remaining = float(b.amount) - spent
	progress = spent / float(b.amount) if b.amount else 0.0
	status = "ok"
	if progress >= 1.0:
		status = "critical"
	elif progress >= 0.8:
		status = "warning"
	return spent, remaining, progress, status


@router.get("/budgets", response_model=List[BudgetWithProgress])
def list_budgets(user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> List[BudgetWithProgress]:
	items = db.query(Budget).filter(Budget.user_id == user_id).order_by(Budget.month.desc(), Budget.name.asc()).all()
	result: List[BudgetWithProgress] = []
	for b in items:
		spent, remaining, progress, status = _progress_for_budget(db, user_id, b)
		result.append(BudgetWithProgress.model_validate({
			"id": b.id,
			"user_id": b.user_id,
			"name": b.name,
			"month": b.month,
			"amount": float(b.amount),
			"category_id": b.category_id,
			"spent": spent,
			"remaining": remaining,
			"progress": progress,
			"status": status,
		}))
	return result


@router.post("/budgets", response_model=BudgetRead)
def create_budget(payload: BudgetCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> BudgetRead:
	item = Budget(user_id=user_id, name=payload.name, month=payload.month, amount=payload.amount, category_id=payload.category_id)
	db.add(item)
	db.commit()
	db.refresh(item)
	return item


@router.put("/budgets/{budget_id}", response_model=BudgetRead)
def update_budget(budget_id: int, payload: BudgetUpdate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> BudgetRead:
	item = db.query(Budget).filter(Budget.user_id == user_id, Budget.id == budget_id).first()
	if not item:
		raise HTTPException(status_code=404, detail="Budget not found")
	for field, value in payload.model_dump(exclude_unset=True).items():
		setattr(item, field, value)
	db.add(item)
	db.commit()
	db.refresh(item)
	return item


@router.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int, user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> dict:
	item = db.query(Budget).filter(Budget.user_id == user_id, Budget.id == budget_id).first()
	if not item:
		raise HTTPException(status_code=404, detail="Budget not found")
	db.delete(item)
	db.commit()
	return {"ok": True}