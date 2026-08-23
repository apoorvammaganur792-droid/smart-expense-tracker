from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

import os


# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

load_dotenv()


# =====================================================
# JWT CONFIGURATION
# =====================================================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "1440"
    )
)


# =====================================================
# PASSWORD HASHING
# =====================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =====================================================
# HASH PASSWORD
# =====================================================

def hash_password(password: str) -> str:

    return pwd_context.hash(password)


# =====================================================
# VERIFY PASSWORD
# =====================================================

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# =====================================================
# CREATE JWT TOKEN
# =====================================================

def create_access_token(user_id: int):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {

        "sub": str(user_id),

        "exp": expire

    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =====================================================
# GET USER ID FROM JWT
# =====================================================

def get_user_id_from_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")


        if user_id is None:

            return None


        return int(user_id)


    except (
        JWTError,
        ValueError
    ):

        return None