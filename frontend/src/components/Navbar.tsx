import { useState, useEffect } from 'react'
import apiService from '../services/api'

interface NavbarProps {
  currentPage?: 'checkin' | 'dashboard' | 'login' | 'register'
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  membershipType?: string
  createdAt: string
}

export default function Navbar({ currentPage }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const authenticated = apiService.isAuthenticated()
    setIsLoggedIn(authenticated)
    
    if (authenticated) {
      const userData = apiService.getCurrentUser()
      setUser(userData)
    }
  }

  const handleLogout = () => {
    apiService.logout()
    setIsLoggedIn(false)
    setUser(null)
    window.location.href = '/checkin'
  }

  const navigation = [
    { name: 'Check-In', href: '/checkin', id: 'checkin', icon: '🚀' },
    { name: 'Dashboard', href: '/dashboard', id: 'dashboard', icon: '📊', requireAuth: true },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/checkin" className="flex items-center space-x-2">
              <span className="text-2xl">🏋️</span>
              <span className="text-xl font-bold text-gray-900">Fairford Gym</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              if (item.requireAuth && !isLoggedIn) return null
              
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              )
            })}

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                >
                  <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm text-primary-600">👤</span>
                  </span>
                  <span>{user?.firstName}</span>
                  <span className="text-xs">▼</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <a
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📊 Dashboard
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <a
                  href="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === 'login'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === 'register'
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  Register
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-600 p-2"
            >
              <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200">
            <div className="space-y-2">
              {navigation.map((item) => {
                if (item.requireAuth && !isLoggedIn) return null
                
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      currentPage === item.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                )
              })}

              {isLoggedIn ? (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 w-full text-left"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <a
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Register
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  )
}