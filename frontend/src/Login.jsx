import { useState } from 'react'
import './Login.css'
import api from './api'


function Login({ onLogin, onRegister }) {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (event) => {

    event.preventDefault()

    setMessage('')
    setLoading(true)


    try {

      // =================================================
      // LOGIN API
      // =================================================

      const data = await api.post(
        '/api/auth/login',
        {
          email: email.trim(),
          password: password
        }
      )


      console.log(
        'Login successful:',
        data
      )


      // =================================================
      // SAVE JWT
      // =================================================

      localStorage.setItem(
        'access_token',
        data.access_token
      )


      // =================================================
      // SAVE USER
      // =================================================

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      )


      // =================================================
      // SEND USER TO APP
      // =================================================

      onLogin(data.user)


    } catch (error) {

      console.error(
        'Login error:',
        error
      )

      setMessage(
        error.message ||
        'Login failed'
      )

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="login-page">

      <div className="login-card">


        {/* HEADER */}

        <div className="login-header">

          <div className="login-icon">
            💰
          </div>

          <h1>
            Smart Expense Tracker
          </h1>

          <p>
            Login to manage your expenses
          </p>

        </div>


        {/* FORM */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >


          {/* EMAIL */}

          <div className="login-form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="login-form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter your password"
              required
            />

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading
              ? 'Logging in...'
              : 'Login'}

          </button>

        </form>


        {/* MESSAGE */}

        {message && (

          <p className="login-message">
            {message}
          </p>

        )}


        {/* REGISTER */}

        <div className="login-footer">

          <p>

            Don't have an account?

            {' '}

            <button
              type="button"
              className="register-link"
              onClick={onRegister}
            >
              Register
            </button>

          </p>

        </div>


      </div>

    </div>

  )

}


export default Login