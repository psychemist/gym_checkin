import { useState, useEffect } from 'react'
import type { LoginRequest } from '../types'
import apiService from '../services/api'

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [savedEmails, setSavedEmails] = useState<string[]>([])

  useEffect(() => {
    const savedCredentials = localStorage.getItem('gymSavedEmails')
    if (savedCredentials) {
      setSavedEmails(JSON.parse(savedCredentials))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEmailSelect = (email: string) => {
    setFormData({ ...formData, email })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Enhanced login with remember me functionality
      await apiService.login(formData)
      
      if (rememberMe) {
        const currentSavedEmails = JSON.parse(localStorage.getItem('gymSavedEmails') || '[]')
        const updatedEmails = [formData.email, ...currentSavedEmails.filter((email: string) => email !== formData.email)].slice(0, 5)
        localStorage.setItem('gymSavedEmails', JSON.stringify(updatedEmails))
        
        // Save user preferences
        localStorage.setItem('gymPreferences', JSON.stringify({
          autoCheckIn: true,
          notifications: true,
          theme: 'light',
          lastLogin: new Date().toISOString(),
          rememberLogin: true
        }))
      }
      
      // Redirect to check-in for immediate check-in
      window.location.href = '/checkin'

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
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

            {savedEmails.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quick Login
                </label>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {savedEmails.slice(0, 3).map((email, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmailSelect(email)}
                      className="text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border text-sm transition-colors"
                    >
                      📧 {email}
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-500 mb-4">
                  Or sign in manually below
                </div>
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
                placeholder="chike@boyega.com"
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
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me for faster check-ins
              </label>
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


      </div>
    </div>
  )
}