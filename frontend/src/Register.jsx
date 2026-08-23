import { useState } from 'react'
import './Register.css'
import api from './api'


function Register({ onRegister }) {

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)


  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (event) => {

    event.preventDefault()

    setMessage('')
    setLoading(true)


    try {

      const data = await api.post(
        '/api/auth/register',
        {
          name: name.trim(),
          email: email.trim(),
          password: password
        }
      )


      console.log(
        'Registration successful:',
        data
      )


      setMessage(
        'Registration successful! Please login.'
      )


      setName('')
      setEmail('')
      setPassword('')


      // Go back to login
      setTimeout(() => {

        onRegister()

      }, 1000)


    } catch (error) {

      console.error(
        'Registration error:',
        error
      )

      setMessage(
        error.message ||
        'Registration failed'
      )

    } finally {

      setLoading(false)

    }

  }


  return (

    <div className="register-page">

      <div className="register-card">


        {/* HEADER */}

        <div className="register-header">

          <div className="register-icon">
            💰
          </div>

          <h1>
            Create Account
          </h1>

          <p>
            Start tracking your expenses
          </p>

        </div>


        {/* FORM */}

        <form
          className="register-form"
          onSubmit={handleRegister}
        >


          {/* NAME */}

          <div className="register-form-group">

            <label>
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter your name"
              required
            />

          </div>


          {/* EMAIL */}

          <div className="register-form-group">

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

          <div className="register-form-group">

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
              placeholder="Create a password"
              minLength="6"
              required
            />

          </div>


          {/* BUTTON */}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >

            {loading
              ? 'Creating Account...'
              : 'Register'}

          </button>

        </form>


        {/* MESSAGE */}

        {message && (

          <p className="register-message">
            {message}
          </p>

        )}


        {/* LOGIN */}

        <div className="register-footer">

          <p>

            Already have an account?

            {' '}

            <button
              type="button"
              className="login-link"
              onClick={onRegister}
            >
              Login
            </button>

          </p>

        </div>


      </div>

    </div>

  )

}


export default Register