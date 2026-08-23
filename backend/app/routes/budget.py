from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import Budget, Expense

from ..schemas import (
    BudgetCreate,
    BudgetResponse
)

from ..dependencies import get_current_user


router = APIRouter(
    prefix="/api/budget",
    tags=["Budget"]
)


# =====================================================
# GET CURRENT MONTH BUDGET
# =====================================================

@router.get(
    "/current"
)
def get_current_budget(

    month: int,

    year: int,

    db: Session = Depends(get_db),

    current_user_id: int = Depends(
        get_current_user
    )

):

    budget = (

        db.query(Budget)

        .filter(

            Budget.user_id == current_user_id,

            Budget.month == month,

            Budget.year == year

        )

        .first()

    )


    spent = 0


    expenses = (

        db.query(Expense)

        .filter(

            Expense.user_id == current_user_id

        )

        .all()

    )


    for expense in expenses:

        if (
            expense.expense_date.month == month
            and
            expense.expense_date.year == year
        ):

            spent += expense.amount


    budget_amount = (
        budget.amount
        if budget
        else 0
    )


    return {

        "budget": budget_amount,

        "spent": spent,

        "remaining":
            budget_amount - spent,

        "month": month,

        "year": year

    }


# =====================================================
# CREATE / UPDATE BUDGET
# =====================================================

@router.post(
    "/",
    response_model=BudgetResponse
)
def create_or_update_budget(

    budget: BudgetCreate,

    db: Session = Depends(get_db),

    current_user_id: int = Depends(
        get_current_user
    )

):

    if budget.month < 1 or budget.month > 12:

        raise HTTPException(
            status_code=400,
            detail="Invalid month"
        )


    if budget.amount < 0:

        raise HTTPException(
            status_code=400,
            detail="Budget cannot be negative"
        )


    existing = (

        db.query(Budget)

        .filter(

            Budget.user_id == current_user_id,

            Budget.month == budget.month,

            Budget.year == budget.year

        )

        .first()

    )


    if existing:

        existing.amount = budget.amount

        db.commit()

        db.refresh(existing)

        return existing


    new_budget = Budget(

        user_id=current_user_id,

        month=budget.month,

        year=budget.year,

        amount=budget.amount

    )


    db.add(new_budget)

    db.commit()

    db.refresh(new_budget)

    return new_budget