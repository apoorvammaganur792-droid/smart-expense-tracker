# \# Smart Expense Tracker

# 

# A full-stack expense tracking and monthly budget management application built with React, FastAPI, PostgreSQL, and JWT authentication.

# 

# \## 🚀 Project Status

# 

# ✅ Core Features Completed

# 

# \## ✨ Features

# 

# \### 🔐 Authentication

# 

# \- User registration

# \- User login

# \- JWT-based authentication

# \- Protected API routes

# \- Logout functionality

# \- Automatic authentication expiration handling

# 

# \### 💰 Expense Management

# 

# \- Add expenses

# \- Edit expenses

# \- Delete expenses

# \- Categorize expenses

# \- View expense history

# \- Search expenses

# \- Filter expenses by category

# 

# \### 🎯 Budget Management

# 

# \- Set monthly budget

# \- Update monthly budget

# \- Calculate total spending

# \- Calculate remaining budget

# \- Detect budget exceeded status

# \- Display budget usage percentage

# \- Visual budget progress indicator

# 

# \### 📊 Dashboard \& Analytics

# 

# \- Total expenses summary

# \- Transaction count

# \- Category summary

# \- Monthly budget summary

# \- Spending by category

# \- Expense comparison chart

# 

# \## 🛠️ Tech Stack

# 

# \### Frontend

# 

# \- React

# \- Vite

# \- JavaScript

# \- CSS

# \- Recharts

# 

# \### Backend

# 

# \- FastAPI

# \- Python

# \- SQLAlchemy

# \- JWT Authentication

# \- Pydantic

# 

# \### Database

# 

# \- PostgreSQL

# 

# \### Development Tools

# 

# \- Git

# \- GitHub

# \- VS Code

# 

# \## 📁 Project Structure

# 

# ```text

# smart-expense-tracker/

# │

# ├── backend/

# │   ├── app/

# │   │   ├── routes/

# │   │   │   ├── auth.py

# │   │   │   ├── budget.py

# │   │   │   └── expenses.py

# │   │   │

# │   │   ├── database.py

# │   │   ├── dependencies.py

# │   │   ├── main.py

# │   │   ├── models.py

# │   │   ├── schemas.py

# │   │   └── security.py

# │   │

# │   ├── .env

# │   └── venv/

# │

# ├── frontend/

# │   ├── src/

# │   │   ├── App.jsx

# │   │   ├── App.css

# │   │   ├── Login.jsx

# │   │   ├── Login.css

# │   │   ├── Register.jsx

# │   │   ├── Register.css

# │   │   ├── api.js

# │   │   └── main.jsx

# │   │

# │   ├── package.json

# │   └── vite.config.js

# │

# ├── .gitignore

# └── README.md

# ```

# 

# \## ⚙️ Backend Setup

# 

# Navigate to the backend:

# 

# ```bash

# cd backend

# ```

# 

# Create and activate a virtual environment:

# 

# ```bash

# python -m venv venv

# venv\\Scripts\\activate

# ```

# 

# Install dependencies:

# 

# ```bash

# pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv python-jose passlib bcrypt

# ```

# 

# Create a `.env` file inside the `backend` folder:

# 

# ```env

# DATABASE\_URL=your\_postgresql\_database\_url

# ```

# 

# Start the backend:

# 

# ```bash

# uvicorn app.main:app --reload

# ```

# 

# Backend will run at:

# 

# ```text

# http://127.0.0.1:8000

# ```

# 

# \## 💻 Frontend Setup

# 

# Navigate to the frontend:

# 

# ```bash

# cd frontend

# ```

# 

# Install dependencies:

# 

# ```bash

# npm install

# ```

# 

# Start the development server:

# 

# ```bash

# npm run dev

# ```

# 

# Frontend will run at:

# 

# ```text

# http://localhost:5173

# ```

# 

# \## 🔐 Environment Variables

# 

# The database credentials are stored in the backend `.env` file.

# 

# The `.env` file is intentionally excluded from GitHub using `.gitignore`.

# 

# Never commit database passwords, API keys, JWT secrets, or other sensitive credentials to the repository.

# 

# \## 📌 Future Improvements

# 

# \- Expense reports

# \- Advanced analytics

# \- Date-based filtering

# \- Export expenses to CSV/PDF

# \- Recurring expenses

# \- Notifications

# \- Production deployment

# 

# \## 👩‍💻 Author

# 

# Apoorva M Maganur

# 

# \---

# 

# ⭐ If you find this project useful, consider giving it a star on GitHub.

