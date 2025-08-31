import { useState, useEffect } from 'react'

interface CheckInPageProps {
  onCheckIn: () => void;
  onRegister: () => void;
}

export default function CheckInPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check if user is already logged in (Phase 2.3 - auto-login)
    const savedUser = localStorage.getItem('gymUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setIsLoggedIn(true)
      setUserName(`${user.firstName} ${user.lastName}`)
    }
  }, [])

  const handleQuickCheckIn = () => {
    if (isLoggedIn) {
      // Phase 2.3 - Immediate check-in for returning users
      setIsCheckedIn(true)
      console.log('✅ Check-in successful for returning user:', userName)
      // TODO: Call API to record attendance
    }
  }

  const handleNewUserRegistration = () => {
    // Phase 2.3 - Redirect to registration for new users
    window.location.href = '/register'
  }

  const handleExistingUserLogin = () => {
    // Redirect to login page
    window.location.href = '/login'
  }

  // Phase 2.3 Check-in Flow Implementation
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

          {/* Phase 2.2 - Landing Page Implementation */}
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
              <p>🔒 Your data is secure and stored locally</p>
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

  // Phase 2.3 - Returning User Flow (Auto-login successful)
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
                className="btn-primary w-full text-lg"
              >
                🚀 Check In Now
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
                className="btn-secondary w-full mb-3"
                onClick={() => window.location.href = '/dashboard'}
              >
                📊 View Dashboard
              </button>
              <button className="btn-secondary w-full text-sm">
                🏃‍♂️ Log Today's Workout
              </button>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">12</div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gym-green">5</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
        </div>
      </div>
    </div>
  )
}