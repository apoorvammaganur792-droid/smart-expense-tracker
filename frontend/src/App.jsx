import { useEffect, useState } from 'react'
import './App.css'

import Login from './Login'
import Register from './Register'
import api from './api'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'


function App() {

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)


  // =====================================================
  // EXPENSE STATE
  // =====================================================

  const [expenses, setExpenses] = useState([])

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')

  const [editingId, setEditingId] = useState(null)


  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')


  // =====================================================
  // API ERROR
  // =====================================================

  const [apiError, setApiError] = useState('')


  // =====================================================
  // BUDGET STATE
  // =====================================================

  const today = new Date()

  const [budgetAmount, setBudgetAmount] = useState('')
  const [currentBudget, setCurrentBudget] = useState(null)
  const [budgetLoading, setBudgetLoading] = useState(false)


  // =====================================================
  // CURRENT MONTH / YEAR
  // =====================================================

  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()


  // =====================================================
  // RESET EXPENSE FORM
  // =====================================================

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setCategory('Food')
    setEditingId(null)
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  const forceLogout = () => {

    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    setIsLoggedIn(false)
    setCurrentUser(null)

    setExpenses([])

    setCurrentBudget(null)
    setBudgetAmount('')

    resetForm()

    setSearchTerm('')
    setFilterCategory('All')

    setApiError('')
  }


  // =====================================================
  // JWT EXPIRATION LISTENER
  // =====================================================

  useEffect(() => {

    const handleAuthExpired = () => {
      forceLogout()
    }

    window.addEventListener(
      'auth-expired',
      handleAuthExpired
    )

    return () => {

      window.removeEventListener(
        'auth-expired',
        handleAuthExpired
      )

    }

  }, [])


  // =====================================================
  // RESTORE LOGIN
  // =====================================================

  useEffect(() => {

    const token =
      localStorage.getItem('access_token')

    const savedUser =
      localStorage.getItem('user')


    if (token && savedUser) {

      try {

        const user =
          JSON.parse(savedUser)

        setCurrentUser(user)
        setIsLoggedIn(true)

      } catch (error) {

        console.error(
          'Error restoring user:',
          error
        )

        localStorage.removeItem(
          'access_token'
        )

        localStorage.removeItem(
          'user'
        )

      }

    }

    setCheckingAuth(false)

  }, [])


  // =====================================================
  // FETCH EXPENSES
  // =====================================================

  const fetchExpenses = async () => {

    try {

      setApiError('')

      const data =
        await api.getExpenses()

      console.log(
        'Expenses loaded:',
        data
      )

      setExpenses(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (error) {

      console.error(
        'Error fetching expenses:',
        error
      )

      setApiError(
        error.message ||
        'Failed to fetch expenses'
      )

    }

  }


  // =====================================================
  // FETCH CURRENT BUDGET
  // =====================================================

  const fetchBudget = async () => {

    try {

      setBudgetLoading(true)

      console.log(
        'Fetching budget:',
        currentMonth,
        currentYear
      )


      const data =
        await api.getCurrentBudget(
          currentMonth,
          currentYear
        )


      console.log(
        'Budget loaded:',
        data
      )


      // =================================================
      // NO BUDGET
      // =================================================

      if (!data) {

        setCurrentBudget(null)
        setBudgetAmount('')

        return
      }


      // =================================================
      // IMPORTANT
      //
      // Backend response:
      //
      // {
      //   budget: 20000,
      //   spent: 9299.96,
      //   remaining: 10700.04,
      //   month: 8,
      //   year: 2026
      // }
      //
      // Therefore we MUST use data.budget
      // =================================================

      const normalizedBudget = {

        ...data,

        amount: Number(
          data?.budget ??
          data?.amount ??
          0
        ),

        spent: Number(
          data?.spent ??
          0
        ),

        remaining: Number(
          data?.remaining ??
          0
        ),

        month: Number(
          data?.month ??
          currentMonth
        ),

        year: Number(
          data?.year ??
          currentYear
        )

      }


      console.log(
        'Normalized budget:',
        normalizedBudget
      )


      setCurrentBudget(
        normalizedBudget
      )


      // IMPORTANT
      // Input must always be a STRING.
      // Prevents controlled/uncontrolled warning.

      setBudgetAmount(
        normalizedBudget.amount > 0
          ? String(normalizedBudget.amount)
          : ''
      )


    } catch (error) {

      console.error(
        'Error fetching budget:',
        error
      )


      // Don't logout here.
      // api.js handles authentication errors.

      setCurrentBudget(null)
      setBudgetAmount('')

    } finally {

      setBudgetLoading(false)

    }

  }


  // =====================================================
  // FETCH DATA AFTER LOGIN
  // =====================================================

  useEffect(() => {

    if (
      !checkingAuth &&
      isLoggedIn &&
      currentUser
    ) {

      fetchExpenses()
      fetchBudget()

    }

  }, [
    checkingAuth,
    isLoggedIn,
    currentUser
  ])


  // =====================================================
  // TOTAL EXPENSE
  // =====================================================

  const totalExpense =
    expenses.reduce(
      (total, expense) => {

        return (
          total +
          Number(
            expense?.amount ?? 0
          )
        )

      },
      0
    )


  // =====================================================
  // TRANSACTION COUNT
  // =====================================================

  const transactionCount =
    expenses.length


  // =====================================================
  // CATEGORY TOTALS
  // =====================================================

  const categoryTotals = {

    Food: 0,
    Transport: 0,
    Shopping: 0,
    Other: 0

  }


  expenses.forEach((expense) => {

    const expenseCategory =
      expense?.category?.trim()


    if (
      categoryTotals[
        expenseCategory
      ] !== undefined
    ) {

      categoryTotals[
        expenseCategory
      ] += Number(
        expense?.amount ?? 0
      )

    }

  })


  // =====================================================
  // PIE CHART DATA
  // =====================================================

  const categoryData =
    Object.entries(
      categoryTotals
    )
      .filter(
        ([_, amount]) =>
          amount > 0
      )
      .map(
        ([name, amount]) => ({
          name,
          amount
        })
      )


  // =====================================================
  // BAR CHART DATA
  // =====================================================

  const expenseChartData =
    expenses.map(
      (expense) => {

        const expenseTitle =
          String(
            expense?.title ?? ''
          )

        return {

          name:
            expenseTitle.length > 15
              ? expenseTitle.substring(
                  0,
                  15
                ) + '...'
              : expenseTitle,

          amount:
            Number(
              expense?.amount ?? 0
            )

        }

      }
    )


  // =====================================================
  // FILTERED EXPENSES
  // =====================================================

  const filteredExpenses =
    expenses.filter(
      (expense) => {

        const expenseTitle =
          String(
            expense?.title ?? ''
          )


        const matchesSearch =
          expenseTitle
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )


        const matchesCategory =
          filterCategory === 'All' ||
          expense?.category?.trim() ===
            filterCategory


        return (
          matchesSearch &&
          matchesCategory
        )

      }
    )


  // =====================================================
  // BUDGET CALCULATIONS
  // =====================================================

  const budgetValue =
    Number(
      currentBudget?.amount ?? 0
    )


  // IMPORTANT:
  // Backend already gives us "spent".
  // Use it when available.

  const budgetSpent =
    currentBudget
      ? Number(
          currentBudget.spent ??
          totalExpense
        )
      : totalExpense


  const budgetRemaining =
    budgetValue -
    budgetSpent


  const budgetPercentage =
    budgetValue > 0
      ? Math.min(
          (
            budgetSpent /
            budgetValue
          ) * 100,
          100
        )
      : 0


  const budgetExceeded =
    budgetValue > 0 &&
    budgetSpent > budgetValue


  // =====================================================
  // SAVE / UPDATE BUDGET
  // =====================================================

  const handleBudgetSubmit =
    async (event) => {

      event.preventDefault()

      setApiError('')


      const token =
        localStorage.getItem(
          'access_token'
        )


      if (!token) {

        forceLogout()

        return
      }


      const numericBudget =
        Number(
          budgetAmount
        )


      if (
        !budgetAmount ||
        !Number.isFinite(
          numericBudget
        ) ||
        numericBudget <= 0
      ) {

        setApiError(
          'Please enter a valid budget amount.'
        )

        return
      }


      try {

        setBudgetLoading(true)


        console.log(
          'Saving budget:',
          {
            month: currentMonth,
            year: currentYear,
            amount: numericBudget
          }
        )


        const savedBudget =
          await api.createOrUpdateBudget({

            month:
              currentMonth,

            year:
              currentYear,

            amount:
              numericBudget

          })


        console.log(
          'Budget saved:',
          savedBudget
        )


        // Fetch fresh data from backend.

        await fetchBudget()


      } catch (error) {

        console.error(
          'Error saving budget:',
          error
        )


        setApiError(
          error.message ||
          'Failed to save budget'
        )

      } finally {

        setBudgetLoading(false)

      }

    }


  // =====================================================
  // ADD / UPDATE EXPENSE
  // =====================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault()

      setApiError('')


      const token =
        localStorage.getItem(
          'access_token'
        )


      if (!token) {

        forceLogout()

        return
      }


      if (!currentUser) {

        setApiError(
          'User is not logged in.'
        )

        return
      }


      if (!title.trim()) {

        setApiError(
          'Please enter an expense title.'
        )

        return
      }


      if (
        !amount ||
        Number(amount) <= 0
      ) {

        setApiError(
          'Please enter a valid amount.'
        )

        return
      }


      const expenseData = {

        title:
          title.trim(),

        amount:
          Number(amount),

        category:
          category.trim()

      }


      try {

        // =================================================
        // UPDATE
        // =================================================

        if (
          editingId !== null
        ) {

          const data =
            await api.updateExpense(
              editingId,
              expenseData
            )


          console.log(
            'Expense updated:',
            data
          )


          resetForm()

          await fetchExpenses()

          await fetchBudget()

          return
        }


        // =================================================
        // CREATE
        // =================================================

        const data =
          await api.createExpense(
            expenseData
          )


        console.log(
          'Expense created:',
          data
        )


        resetForm()

        await fetchExpenses()

        await fetchBudget()


      } catch (error) {

        console.error(
          'Error saving expense:',
          error
        )


        setApiError(
          error.message ||
          'Failed to save expense'
        )

      }

    }


  // =====================================================
  // EDIT EXPENSE
  // =====================================================

  const editExpense =
    (expense) => {

      setEditingId(
        expense.id
      )

      setTitle(
        String(
          expense?.title ?? ''
        )
      )

      setAmount(
        String(
          expense?.amount ?? ''
        )
      )

      setCategory(
        expense?.category?.trim() ||
        'Food'
      )


      window.scrollTo({

        top: 0,

        behavior: 'smooth'

      })

    }


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit = () => {

    resetForm()

  }


  // =====================================================
  // DELETE EXPENSE
  // =====================================================

  const deleteExpense =
    async (id) => {

      const confirmDelete =
        window.confirm(
          'Are you sure you want to delete this expense?'
        )


      if (!confirmDelete) {

        return
      }


      try {

        setApiError('')


        const data =
          await api.deleteExpense(
            id
          )


        console.log(
          'Expense deleted:',
          data
        )


        await fetchExpenses()

        await fetchBudget()


      } catch (error) {

        console.error(
          'Error deleting expense:',
          error
        )


        setApiError(
          error.message ||
          'Failed to delete expense'
        )

      }

    }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {

    setSearchTerm('')
    setFilterCategory('All')

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    forceLogout()

  }


  // =====================================================
  // AUTH LOADING
  // =====================================================

  if (checkingAuth) {

    return (

      <div className="auth-loading">

        <h2>
          Loading Smart Expense Tracker...
        </h2>

      </div>

    )

  }


  // =====================================================
  // LOGIN
  // =====================================================

  if (
    !isLoggedIn &&
    !showRegister
  ) {

    return (

      <Login

        onLogin={(user) => {

          console.log(
            'Logged in user:',
            user
          )

          setCurrentUser(user)
          setIsLoggedIn(true)

        }}


        onRegister={() => {

          setShowRegister(true)

        }}

      />

    )

  }


  // =====================================================
  // REGISTER
  // =====================================================

  if (
    !isLoggedIn &&
    showRegister
  ) {

    return (

      <Register

        onRegister={() => {

          setShowRegister(false)

        }}

      />

    )

  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div className="dashboard">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            Smart Expense Tracker
          </h1>

          <p>

            Welcome,{' '}

            {currentUser?.name ||
              'User'}

          </p>

        </div>


        <button
          className="logout-button"
          onClick={
            handleLogout
          }
        >

          Logout

        </button>

      </header>


      {/* =================================================
          API ERROR
      ================================================= */}

      {apiError && (

        <div className="api-error">

          {apiError}

        </div>

      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="summary-grid">


        <div className="summary-card">

          <span className="card-icon">
            💰
          </span>

          <h3>
            Total Expenses
          </h3>

          <p>

            ₹
            {totalExpense.toLocaleString(
              'en-IN',
              {
                maximumFractionDigits: 2
              }
            )}

          </p>

        </div>


        <div className="summary-card">

          <span className="card-icon">
            📊
          </span>

          <h3>
            Transactions
          </h3>

          <p>
            {transactionCount}
          </p>

        </div>


        <div className="summary-card">

          <span className="card-icon">
            📂
          </span>

          <h3>
            Categories
          </h3>

          <p>
            4
          </p>

        </div>


        <div className="summary-card">

          <span className="card-icon">
            🎯
          </span>

          <h3>
            Monthly Budget
          </h3>

          <p>

            ₹
            {budgetValue.toLocaleString(
              'en-IN',
              {
                maximumFractionDigits: 2
              }
            )}

          </p>

        </div>


      </section>


      {/* =================================================
          MONTHLY BUDGET
      ================================================= */}

      <section className="dashboard-section">

        <h2>
          Monthly Budget
        </h2>

        <p>

          {today.toLocaleString(
            'en-IN',
            {
              month: 'long',
              year: 'numeric'
            }
          )}

        </p>


        <form
          className="expense-form"
          onSubmit={
            handleBudgetSubmit
          }
        >

          <div className="form-group">

            <label>
              Budget Amount
            </label>

            <input
              type="number"
              value={budgetAmount}
              onChange={(event) =>
                setBudgetAmount(
                  event.target.value
                )
              }
              placeholder="Enter monthly budget"
              min="0"
              step="0.01"
              required
            />

          </div>


          <div className="form-buttons">

            <button
              className="primary-button"
              type="submit"
              disabled={budgetLoading}
            >

              {budgetLoading
                ? 'Saving...'
                : currentBudget
                ? 'Update Budget'
                : 'Set Budget'}

            </button>

          </div>

        </form>


        {/* =================================================
            BUDGET DETAILS
        ================================================= */}

        {budgetValue > 0 && (

          <div className="budget-details">


            <div className="budget-row">

              <span>
                Budget
              </span>

              <strong>

                ₹
                {budgetValue.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2
                  }
                )}

              </strong>

            </div>


            <div className="budget-row">

              <span>
                Spent
              </span>

              <strong>

                ₹
                {budgetSpent.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2
                  }
                )}

              </strong>

            </div>


            <div className="budget-row">

              <span>

                {budgetExceeded
                  ? 'Exceeded'
                  : 'Remaining'}

              </span>

              <strong
                className={
                  budgetExceeded
                    ? 'budget-danger'
                    : 'budget-success'
                }
              >

                ₹
                {Math.abs(
                  budgetRemaining
                ).toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2
                  }
                )}

              </strong>

            </div>


            <div className="budget-progress">

              <div
                className={
                  budgetExceeded
                    ? 'budget-progress-bar danger'
                    : 'budget-progress-bar'
                }
                style={{
                  width:
                    `${budgetPercentage}%`
                }}
              />

            </div>


            <p className="budget-percentage">

              {budgetExceeded

                ? `⚠️ Budget exceeded by ₹${Math.abs(
                    budgetRemaining
                  ).toLocaleString(
                    'en-IN',
                    {
                      maximumFractionDigits: 2
                    }
                  )}`

                : `${budgetPercentage.toFixed(
                    1
                  )}% of your budget used`}

            </p>


          </div>

        )}


      </section>


      {/* =================================================
          CATEGORY SUMMARY
      ================================================= */}

      <section className="dashboard-section">

        <h2>
          Category Summary
        </h2>


        <div className="category-grid">


          <div className="category-card">

            <span>
              🍔
            </span>

            <div>

              <h3>
                Food
              </h3>

              <p>

                ₹
                {categoryTotals.Food.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2
                  }
                )}

              </p>

            </div>

          </div>


          <div className="category-card">

            <span>
              🚌
            </span>

            <div>

              <h3>
                Transport
              </h3>

              <p>

                ₹
                {categoryTotals.Transport.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2
                  }
                )}

              </p>

            </div>

          </div>


          <div className="category-card">

            <span>
              🛍️
            </span>

            <div>

              <h3>
                Shopping
              </h3>

              <p>

                ₹
                {categoryTotals.Shopping.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2
                  }
                )}

              </p>

            </div>

          </div>


          <div className="category-card">

            <span>
              📦
            </span>

            <div>

              <h3>
                Other
              </h3>

              <p>

                ₹
                {categoryTotals.Other.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2
                  }
                )}

              </p>

            </div>

          </div>


        </div>

      </section>


      {/* =================================================
          ADD / EDIT EXPENSE
      ================================================= */}

      <section className="dashboard-section">

        <h2>

          {editingId !== null
            ? 'Edit Expense'
            : 'Add Expense'}

        </h2>


        <form
          className="expense-form"
          onSubmit={
            handleSubmit
          }
        >


          <div className="form-group">

            <label>
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Enter expense"
              required
            />

          </div>


          <div className="form-group">

            <label>
              Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value
                )
              }
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />

          </div>


          <div className="form-group">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >

              <option value="Food">
                Food
              </option>

              <option value="Transport">
                Transport
              </option>

              <option value="Shopping">
                Shopping
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div className="form-buttons">

            <button
              className="primary-button"
              type="submit"
            >

              {editingId !== null
                ? 'Update Expense'
                : 'Add Expense'}

            </button>


            {editingId !== null && (

              <button
                className="cancel-button"
                type="button"
                onClick={
                  cancelEdit
                }
              >

                Cancel

              </button>

            )}

          </div>


        </form>

      </section>


      {/* =================================================
          EXPENSE HISTORY
      ================================================= */}

      <section className="dashboard-section">


        <div className="expense-history-header">

          <div>

            <h2>
              Expense History
            </h2>

            <p className="result-count">

              Showing{' '}

              {filteredExpenses.length}

              {' '}of{' '}

              {expenses.length}

              {' '}expenses

            </p>

          </div>

        </div>


        {/* SEARCH + FILTER */}

        <div className="filter-container">


          <div className="search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search expenses..."
            />

          </div>


          <select
            className="category-filter"
            value={filterCategory}
            onChange={(event) =>
              setFilterCategory(
                event.target.value
              )
            }
          >

            <option value="All">
              All Categories
            </option>

            <option value="Food">
              Food
            </option>

            <option value="Transport">
              Transport
            </option>

            <option value="Shopping">
              Shopping
            </option>

            <option value="Other">
              Other
            </option>

          </select>


          {(searchTerm !== '' ||
            filterCategory !== 'All') && (

            <button
              className="clear-filter-button"
              type="button"
              onClick={
                clearFilters
              }
            >

              Clear

            </button>

          )}


        </div>


        {/* EXPENSE LIST */}

        {filteredExpenses.length === 0 ? (

          <div className="empty-message">

            <p>
              No expenses found.
            </p>


            {(searchTerm !== '' ||
              filterCategory !== 'All') && (

              <button
                className="clear-filter-button"
                type="button"
                onClick={
                  clearFilters
                }
              >

                Clear Search & Filter

              </button>

            )}

          </div>

        ) : (

          <div className="expense-list">

            {filteredExpenses.map(
              (expense) => (

                <div
                  className="expense-card"
                  key={expense.id}
                >


                  <div className="expense-info">

                    <h3>
                      {expense.title}
                    </h3>

                    <span className="expense-category">

                      {expense.category?.trim()}

                    </span>

                  </div>


                  <div className="expense-right">

                    <strong>

                      ₹
                      {Number(
                        expense.amount
                      ).toLocaleString(
                        'en-IN',
                        {
                          maximumFractionDigits: 2
                        }
                      )}

                    </strong>


                    <div className="expense-actions">


                      <button
                        className="edit-button"
                        type="button"
                        onClick={() =>
                          editExpense(
                            expense
                          )
                        }
                      >

                        Edit

                      </button>


                      <button
                        className="delete-button"
                        type="button"
                        onClick={() =>
                          deleteExpense(
                            expense.id
                          )
                        }
                      >

                        Delete

                      </button>


                    </div>

                  </div>


                </div>

              )
            )}

          </div>

        )}


      </section>


      {/* =================================================
          SPENDING BY CATEGORY
      ================================================= */}

      <section className="dashboard-section">

        <div className="chart-container">

          <h2>
            Spending by Category
          </h2>


          {categoryData.length === 0 ? (

            <p className="no-chart-data">
              No expense data available.
            </p>

          ) : (

            <div className="pie-chart-wrapper">


              <ResponsiveContainer
                width="100%"
                height={400}
              >

                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={130}
                    paddingAngle={4}
                    label={({
                      name,
                      percent
                    }) =>
                      `${name} ${(
                        percent * 100
                      ).toFixed(0)}%`
                    }
                    labelLine={false}
                  >

                    {categoryData.map(
                      (entry, index) => {

                        const colors = [
                          '#4ade80',
                          '#60a5fa',
                          '#fbbf24',
                          '#f87171'
                        ]

                        return (

                          <Cell
                            key={
                              `cell-${index}`
                            }
                            fill={
                              colors[
                                index %
                                colors.length
                              ]
                            }
                          />

                        )

                      }
                    )}

                  </Pie>


                  <Tooltip
                    formatter={(value) => [

                      `₹${Number(
                        value
                      ).toLocaleString(
                        'en-IN',
                        {
                          maximumFractionDigits: 2
                        }
                      )}`,

                      'Amount'

                    ]}
                  />


                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />


                </PieChart>

              </ResponsiveContainer>


              <div className="chart-center">

                <span>
                  Total
                </span>

                <strong>

                  ₹
                  {totalExpense.toLocaleString(
                    'en-IN',
                    {
                      maximumFractionDigits: 2
                    }
                  )}

                </strong>

              </div>


            </div>

          )}

        </div>

      </section>


      {/* =================================================
          EXPENSE COMPARISON
      ================================================= */}

      <section className="dashboard-section">

        <div className="chart-container">

          <h2>
            Expense Comparison
          </h2>


          {expenseChartData.length === 0 ? (

            <p className="no-chart-data">
              No expense data available.
            </p>

          ) : (

            <div className="bar-chart-wrapper">

              <ResponsiveContainer
                width="100%"
                height={400}
              >

                <BarChart
                  data={
                    expenseChartData
                  }
                  margin={{

                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60

                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2b303a"
                  />


                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: '#9ca3af'
                    }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />


                  <YAxis
                    tick={{
                      fill: '#9ca3af'
                    }}
                  />


                  <Tooltip
                    formatter={(value) => [

                      `₹${Number(
                        value
                      ).toLocaleString(
                        'en-IN',
                        {
                          maximumFractionDigits: 2
                        }
                      )}`,

                      'Amount'

                    ]}
                  />


                  <Bar
                    dataKey="amount"
                    name="Expense"
                    fill="#8ce8f0"
                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

      </section>


    </div>

  )

}


export default App