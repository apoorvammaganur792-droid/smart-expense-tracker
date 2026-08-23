from pydantic import BaseModel
from datetime import date


# =====================================================
# EXPENSE CREATE
# =====================================================

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    expense_date: date | None = None


# =====================================================
# EXPENSE RESPONSE
# =====================================================

class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    expense_date: date
    user_id: int

    class Config:
        from_attributes = True


# =====================================================
# BUDGET
# =====================================================

class BudgetCreate(BaseModel):
    month: int
    year: int
    amount: float


class BudgetResponse(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    amount: float

    class Config:
        from_attributes = True