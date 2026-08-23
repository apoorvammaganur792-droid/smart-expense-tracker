from sqlalchemy import Column, Integer, String, Float, Date, DateTime, UniqueConstraint
from datetime import date, datetime

from .database import Base


# =====================================================
# EXPENSE MODEL
# =====================================================

class Expense(Base):

    __tablename__ = "expenses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(100),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    category = Column(
        String(50),
        nullable=False
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    expense_date = Column(
        Date,
        nullable=False,
        default=date.today
    )


# =====================================================
# BUDGET MODEL
# =====================================================

class Budget(Base):

    __tablename__ = "budgets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    month = Column(
        Integer,
        nullable=False
    )

    year = Column(
        Integer,
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "month",
            "year",
            name="unique_user_month_year"
        ),
    )