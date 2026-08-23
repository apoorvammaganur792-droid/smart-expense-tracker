from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

from ..database import get_db
from ..security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# =========================
# REGISTER
# =========================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


@router.post("/register")
def register_user(
    user: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.execute(
        text("""
            SELECT id
            FROM users
            WHERE email = :email
        """),
        {
            "email": user.email
        }
    ).fetchone()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(
        user.password
    )

    result = db.execute(
        text("""
            INSERT INTO users (name, email, password)
            VALUES (:name, :email, :password)
            RETURNING id, name, email
        """),
        {
            "name": user.name,
            "email": user.email,
            "password": hashed_password
        }
    )

    new_user = result.fetchone()

    db.commit()

    return {
        "message": "Registration successful",
        "user": {
            "id": new_user[0],
            "name": new_user[1],
            "email": new_user[2]
        }
    }


# =========================
# LOGIN
# =========================

class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login_user(
    user: LoginRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.execute(
        text("""
            SELECT id, name, email, password
            FROM users
            WHERE email = :email
        """),
        {
            "email": user.email
        }
    ).fetchone()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_valid = verify_password(
        user.password,
        existing_user[3]
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        existing_user[0]
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": existing_user[0],
            "name": existing_user[1],
            "email": existing_user[2]
        }
    }