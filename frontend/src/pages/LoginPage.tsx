import { useState } from 'react'
import type { LoginRequest } from '../types'

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Phase 2.3 - Existing User Login Implementation
      // TODO: Replace with actual API call in next phases
      
      // Simulate login verification
      // In real implementation, this would validate against database
      const existingUser = localStorage.getItem('gymUser')
      
      if (!existingUser) {
        setError('User not found. Please register first or check your credentials.')
        return
      }

      const user = JSON.parse(existingUser)
      if (user.email !== formData.email) {
        setError('Invalid email or password. Please try again.')
        return
      }

      // Successful login - refresh token and redirect
      localStorage.setItem('gymToken', `token_${Date.now()}`)
      
      // Redirect to check-in for immediate check-in
      window.location.href = '/checkin'

    } catch (err) {
      setError(`Login failed. Please try again. Error: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👋 Welcome Back!
          </h1>
          <p className="text-gray-600">
            Sign in to continue your fitness journey
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg disabled:opacity-50"
            >
              {isLoading ? '🔄 Signing In...' : '🚀 Sign In & Check In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account yet?{' '}
              <a href="/register" className="text-primary-600 hover:underline font-semibold">
                Register here
              </a>
            </p>
          </div>

          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-gray-500 hover:text-primary-600">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Quick Access Info */}
        <div className="mt-4 card bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-sm text-blue-600">
              💡 <strong>Quick Access:</strong> Your login info is saved for faster check-ins!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}