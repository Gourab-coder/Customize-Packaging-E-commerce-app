import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './SignCard.css'

export default function SignCard({ isOpen, onClose }) {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()

  if (!isOpen) {
    return null
  }

  const isLogin = mode === 'login'

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    setError('')
  }

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password }

      const response = isLogin ? await api.login(payload) : await api.register(payload)
      login(response.token, response.user)
      resetForm()
      onClose()
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="sign-overlay" onClick={onClose} role="presentation">
      <section
        className="sign-card"
        onClick={(event) => event.stopPropagation()}
        aria-modal="true"
        role="dialog"
        aria-label={isLogin ? 'Login form' : 'Register form'}
      >
        <button
          type="button"
          className="sign-close-btn"
          onClick={onClose}
          aria-label="Close authentication form"
        >
          x
        </button>

        <div className="sign-switcher">
          <button
            type="button"
            className={`sign-switch-btn ${isLogin ? 'active' : ''}`}
            onClick={() => handleModeChange('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`sign-switch-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => handleModeChange('register')}
          >
            Register
          </button>
        </div>

        <h2 className="sign-title">{isLogin ? 'Welcome back' : 'Create account'}</h2>
        <p className="sign-subtitle">
          {isLogin
            ? 'Log in to continue customizing your packaging.'
            : 'Register to save designs and track your orders.'}
        </p>

        <form className="sign-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="sign-field">
              Full Name
              <input
                type="text"
                placeholder="Enter your full name"
                required
                value={formData.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </label>
          )}

          <label className="sign-field">
            Email
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>

          <label className="sign-field">
            Password
            <input
              type="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </label>

          {!isLogin && (
            <label className="sign-field">
              Confirm Password
              <input
                type="password"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
              />
            </label>
          )}

          {error && <p className="sign-error">{error}</p>}

          <button type="submit" className="sign-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
      </section>
    </div>
  )
}
