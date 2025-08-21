from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta
from typing import Dict, Any, List
from app.api.deps import get_current_user, get_db_session
from app.models.transaction import Transaction
from app.models.category import Category

router = APIRouter()


def _month_start(d: date) -> date:
	return d.replace(day=1)


def _add_months(d: date, months: int) -> date:
	year = d.year + (d.month - 1 + months) // 12
	month = (d.month - 1 + months) % 12 + 1
	day = 1
	return date(year, month, day)


@router.get("/summary")
def get_summary(user_id: str = Depends(get_current_user), db: Session = Depends(get_db_session)) -> Dict[str, Any]:
	today = date.today()
	start_month = _month_start(today)
	# Monthly income and expenses
	monthly_income = (
		db.query(func.coalesce(func.sum(Transaction.amount), 0))
		.filter(Transaction.user_id == user_id, Transaction.date >= start_month, Transaction.amount > 0)
		.scalar()
	)
	monthly_expenses = (
		-db.query(func.coalesce(func.sum(Transaction.amount), 0))
		.filter(Transaction.user_id == user_id, Transaction.date >= start_month, Transaction.amount < 0)
		.scalar()
	)
	current_balance = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(Transaction.user_id == user_id).scalar()
	savings_rate = (monthly_income - monthly_expenses) / monthly_income if monthly_income > 0 else 0

	# Expenses by category this month
	expense_rows = (
		db.query(Category.name, -func.sum(Transaction.amount))
		.join(Category, Category.id == Transaction.category_id)
		.filter(Transaction.user_id == user_id, Transaction.date >= start_month, Transaction.amount < 0)
		.group_by(Category.name)
		.order_by(func.sum(Transaction.amount))
		.all()
	)
	expenses_by_category = [{"category": name, "amount": float(amount or 0)} for name, amount in expense_rows]

	# 12-month income vs expenses
	months: List[Dict[str, Any]] = []
	base = _month_start(_add_months(today, -11))
	for i in range(12):
		m_start = _add_months(base, i)
		m_end = _add_months(base, i + 1) - timedelta(days=1)
		income = (
			db.query(func.coalesce(func.sum(Transaction.amount), 0))
			.filter(Transaction.user_id == user_id, Transaction.date >= m_start, Transaction.date <= m_end, Transaction.amount > 0)
			.scalar()
		)
		exp = (
			-db.query(func.coalesce(func.sum(Transaction.amount), 0))
			.filter(Transaction.user_id == user_id, Transaction.date >= m_start, Transaction.date <= m_end, Transaction.amount < 0)
			.scalar()
		)
		label = f"{m_start.year}-{m_start.month:02d}"
		months.append({"month": label, "income": float(income or 0), "expenses": float(exp or 0)})

	# Balance trend cumulative
	balance_trend = []
	cum = 0.0
	for m in months:
		cum += m["income"] - m["expenses"]
		balance_trend.append({"month": m["month"], "balance": cum})

	return {
		"current_balance": float(current_balance or 0),
		"monthly_income": float(monthly_income or 0),
		"monthly_expenses": float(monthly_expenses or 0),
		"savings_rate": savings_rate,
		"expenses_by_category": expenses_by_category,
		"income_vs_expenses": months,
		"balance_trend": balance_trend,
	}