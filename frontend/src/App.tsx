import { useState } from 'react'
import './App.css'

function App() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)

  const handleCheckIn = () => {
    setIsCheckedIn(true)
    // TODO: Implement actual check-in logic in Phase 2
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fairford Gym
          </h1>
          <p className="text-gray-600">
            Welcome! Ready to start your workout?
          </p>
        </div>

        {/* Check-in Card */}
        <div className="card text-center">
          {!isCheckedIn ? (
            <>
              <h2 className="gym-header">Check In</h2>
              <p className="text-gray-600 mb-6">
                Tap the button below to mark your attendance
              </p>
              <button 
                onClick={handleCheckIn}
                className="btn-primary w-full text-lg"
              >
                🏋️ Check In Now
              </button>
              <div className="mt-4 text-sm text-gray-500">
                <p>New member? <span className="text-primary-600 cursor-pointer">Register here</span></p>
              </div>
            </>
          ) : (
            <>
              <div className="text-green-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="gym-header text-green-600">Checked In!</h2>
              <p className="text-gray-600 mb-6">
                Have a great workout session!
              </p>
              <button className="btn-secondary w-full">
                View Dashboard
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
            <div className="text-2xl font-bold text-gym-green">3</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Phase 1: Foundation Setup Complete ✅</p>
        </div>
      </div>
    </div>
  )
}

export default App
