import { useState, useEffect } from 'react'
import apiService from '../services/api'

export default function CheckInPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ thisMonth: 0, currentStreak: 0 })

  useEffect(() => {
    checkAuthAndStatus()
  }, [])

  const checkAuthAndStatus = async () => {
    try {
      // Check if user has a token
      if (!apiService.isAuthenticated()) {
        setIsLoading(false)
        return
      }

      // Verify token and get user info
      const authResponse = await apiService.verifyToken()
      const user = authResponse.user
      setIsLoggedIn(true)
      setUserName(`${user.firstName} ${user.lastName}`)

      // Check current check-in status
      const statusResponse = await apiService.getCurrentStatus() as { isCheckedIn: boolean }
      setIsCheckedIn(statusResponse.isCheckedIn)

      // Get attendance stats
      const historyResponse = await apiService.getAttendanceHistory(30) as { stats: { thisMonth: number, currentStreak: number } }
      setStats({
        thisMonth: historyResponse.stats.thisMonth,
        currentStreak: historyResponse.stats.currentStreak
      })

    } catch (error) {
      console.error('Auth/status check failed:', error)
      // Token is invalid, clear auth state
      apiService.logout()
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickCheckIn = async () => {
    if (!isLoggedIn) return

    setIsLoading(true)
    setError('')

    try {
      // Real API call to record attendance
      const response = await apiService.checkIn() as { message: string }
      setIsCheckedIn(true)
      console.log('✅ Check-in successful:', response.message)
      
      // Refresh stats after check-in
        const historyResponse = await apiService.getAttendanceHistory(30) as {
            stats: { thisMonth: number, currentStreak: number }
        }
      setStats({
        thisMonth: historyResponse.stats.thisMonth,
        currentStreak: historyResponse.stats.currentStreak
      })

    } catch (err: unknown) {
      setError((err as Error).message || 'Check-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    setError('')

    try {
      await apiService.checkOut()
      setIsCheckedIn(false)
      console.log('✅ Check-out successful')
    } catch (err: unknown) {
      setError((err as Error).message || 'Check-out failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewUserRegistration = () => {
    window.location.href = '/register'
  }

  const handleExistingUserLogin = () => {
    window.location.href = '/login'
  }

  const handleLogout = () => {
    apiService.logout()
    setIsLoggedIn(false)
    setIsCheckedIn(false)
    setUserName('')
  }

  // Loading state
  if (isLoading && apiService.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="card">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not logged in - show landing page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏋️ Welcome to Fairford Gym!
            </h1>
            <p className="text-gray-600">
              Ready to start your workout? Let's get you checked in.
            </p>
          </div>

          <div className="card text-center">
            <h2 className="gym-header">Quick Check-In</h2>
            <p className="text-gray-600 mb-6">
              Choose your option to continue
            </p>

            {/* New Member Registration */}
            <button 
              onClick={handleNewUserRegistration}
              className="btn-primary w-full text-lg mb-4"
            >
              🆕 New Member? Register Now
            </button>

            {/* Existing Member Login */}
            <button 
              onClick={handleExistingUserLogin}
              className="btn-secondary w-full text-lg"
            >
              👤 Returning Member? Sign In
            </button>

            <div className="mt-6 text-sm text-gray-500">
              <p>🔒 Your data is secure and encrypted</p>
            </div>
          </div>

          {/* QR Code Info */}
          <div className="mt-6 card bg-blue-50 border-blue-200">
            <div className="text-center">
              <p className="text-sm text-blue-600 mb-2">
                📱 <strong>You scanned the gym QR code!</strong>
              </p>
              <p className="text-xs text-blue-500">
                This is your quick access to check in and track workouts
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Logged in - show dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Welcome Back Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👋 Welcome back, {userName}!
          </h1>
          <p className="text-gray-600">
            Ready for another great workout?
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Check-in Card */}
        <div className="card text-center">
          {!isCheckedIn ? (
            <>
              <h2 className="gym-header text-primary-600">Quick Check-In</h2>
              <p className="text-gray-600 mb-6">
                Tap below to mark your attendance and start your session
              </p>
              <button 
                onClick={handleQuickCheckIn}
                disabled={isLoading}
                className="btn-primary w-full text-lg disabled:opacity-50"
              >
                {isLoading ? '🔄 Checking In...' : '🚀 Check In Now'}
              </button>
              <div className="mt-4 text-sm text-gray-500">
                <p>Session will be automatically detected (Morning/Evening)</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-green-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="gym-header text-green-600">✅ You're Checked In!</h2>
              <p className="text-gray-600 mb-6">
                Have an amazing workout session! 💪
              </p>
              <button 
                onClick={handleCheckOut}
                disabled={isLoading}
                className="btn-secondary w-full mb-3 disabled:opacity-50"
              >
                {isLoading ? '🔄 Checking Out...' : '🏃‍♂️ Check Out'}
              </button>
              <button 
                className="btn-secondary w-full text-sm"
                onClick={() => window.location.href = '/dashboard'}
              >
                📊 View Dashboard
              </button>
            </>
          )}
        </div>

        {/* Real Stats from API */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.thisMonth}</div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gym-green">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
        </div>

        {/* Logout Option */}
        <div className="mt-6 text-center">
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-primary-600"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}