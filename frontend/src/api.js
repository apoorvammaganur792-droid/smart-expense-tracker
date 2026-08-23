const API_URL = 'http://127.0.0.1:8000'


// =====================================================
// COMMON REQUEST FUNCTION
// =====================================================

const request = async (endpoint, options = {}) => {

  const token =
    localStorage.getItem('access_token')


  const headers = {

    'Content-Type': 'application/json',

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`
        }
      : {}),

    ...(options.headers || {})

  }


  try {

    const response =
      await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers
        }
      )


    // =================================================
    // READ RESPONSE
    // =================================================

    let data = null

    try {

      data =
        await response.json()

    } catch {

      data = null

    }


    // =================================================
    // JWT EXPIRED / UNAUTHORIZED
    // =================================================

    if (
      response.status === 401
    ) {

      localStorage.removeItem(
        'access_token'
      )

      localStorage.removeItem(
        'user'
      )


      window.dispatchEvent(
        new Event('auth-expired')
      )


      throw new Error(
        data?.detail ||
        'Session expired. Please login again.'
      )

    }


    // =================================================
    // OTHER API ERROR
    // =================================================

    if (!response.ok) {

      throw new Error(
        data?.detail ||
        'Something went wrong'
      )

    }


    // =================================================
    // SUCCESS
    // =================================================

    return data

  } catch (error) {

    console.error(
      `API Error: ${endpoint}`,
      error
    )

    throw error

  }

}


// =====================================================
// API OBJECT
// =====================================================

const api = {


  // ===================================================
  // GENERIC GET
  // ===================================================

  get: (endpoint) => {

    return request(
      endpoint,
      {
        method: 'GET'
      }
    )

  },


  // ===================================================
  // GENERIC POST
  // ===================================================

  post: (endpoint, data) => {

    return request(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )

  },


  // ===================================================
  // GENERIC PUT
  // ===================================================

  put: (endpoint, data) => {

    return request(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    )

  },


  // ===================================================
  // GENERIC DELETE
  // ===================================================

  delete: (endpoint) => {

    return request(
      endpoint,
      {
        method: 'DELETE'
      }
    )

  },


  // ===================================================
  // EXPENSE API
  // ===================================================

  getExpenses: () => {

    return request(
      '/api/expenses/',
      {
        method: 'GET'
      }
    )

  },


  createExpense: (expense) => {

    return request(
      '/api/expenses/',
      {
        method: 'POST',
        body: JSON.stringify(expense)
      }
    )

  },


  updateExpense: (
    id,
    expense
  ) => {

    return request(
      `/api/expenses/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(expense)
      }
    )

  },


  deleteExpense: (id) => {

    return request(
      `/api/expenses/${id}`,
      {
        method: 'DELETE'
      }
    )

  },


  // ===================================================
  // AUTH API
  // ===================================================

  login: (data) => {

    return request(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )

  },


  register: (data) => {

    return request(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )

  },


  // ===================================================
  // BUDGET API
  // ===================================================

  // GET CURRENT MONTHLY BUDGET

  getCurrentBudget: (
    month,
    year
  ) => {

    return request(
      `/api/budget/current?month=${month}&year=${year}`,
      {
        method: 'GET'
      }
    )

  },


  // CREATE / UPDATE MONTHLY BUDGET

  createOrUpdateBudget: (
    budget
  ) => {

    return request(
      '/api/budget/',
      {
        method: 'POST',
        body: JSON.stringify(budget)
      }
    )

  }

}


// =====================================================
// EXPORT
// =====================================================

export default api