from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from .routes.expenses import router as expenses_router

from .routes.auth import router as auth_router

from .routes.budget import router as budget_router


app = FastAPI(
    title="Smart Expense Tracker API",
    version="1.0.0"
)


app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)


@app.get("/")
def home():

    return {

        "message":
        "Smart Expense Tracker API is running"

    }


app.include_router(
    expenses_router
)

app.include_router(
    auth_router
)

app.include_router(
    budget_router
)