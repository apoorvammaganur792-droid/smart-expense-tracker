from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Expense
from ..schemas import ExpenseCreate, ExpenseResponse
from ..dependencies import get_current_user


router = APIRouter(
    prefix="/api/expenses",
    tags=["Expenses"]
)


# =====================================================
# GET USER EXPENSES
# =====================================================

@router.get(
    "/",
    response_model=list[ExpenseResponse]
)
def get_expenses(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):

    expenses = (
        db.query(Expense)
        .filter(
            Expense.user_id == current_user_id
        )
        .order_by(
            Expense.expense_date.desc(),
            Expense.id.desc()
        )
        .all()
    )

    return expenses


# =====================================================
# CREATE EXPENSE
# =====================================================

@router.post(
    "/",
    response_model=ExpenseResponse
)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):

    new_expense = Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        expense_date=expense.expense_date or date.today(),
        user_id=current_user_id
    )

    db.add(new_expense)

    db.commit()

    db.refresh(new_expense)

    return new_expense


# =====================================================
# UPDATE EXPENSE
# =====================================================

@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):

    existing_expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == current_user_id
        )
        .first()
    )

    if not existing_expense:

        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    existing_expense.title = expense.title
    existing_expense.amount = expense.amount
    existing_expense.category = expense.category

    if expense.expense_date:
        existing_expense.expense_date = expense.expense_date

    db.commit()

    db.refresh(existing_expense)

    return existing_expense


# =====================================================
# DELETE EXPENSE
# =====================================================

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):

    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == current_user_id
        )
        .first()
    )

    if not expense:

        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)

    db.commit()

    return {
        "message": "Expense deleted successfully"
    }