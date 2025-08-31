import { Routes, Route, Navigate } from 'react-router-dom'
import CheckInPage from './pages/CheckInPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Phase 2.2 & 2.3 - Main QR code landing page */}
      <Route path="/checkin" element={<CheckInPage />} />
      
      {/* Authentication routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Redirect root to checkin (for QR code compatibility) */}
      <Route path="/" element={<Navigate to="/checkin" replace />} />
      
      {/* Placeholder for future routes */}
      <Route path="/dashboard" element={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="card text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">📊 Dashboard</h1>
            <p className="text-gray-600 mb-6">Coming in Phase 3!</p>
            <a href="/checkin" className="btn-primary">
              ← Back to Check-In
            </a>
          </div>
        </div>
      } />
      
      {/* 404 fallback */}
      <Route path="*" element={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="card text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">❓ Page Not Found</h1>
            <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
            <a href="/checkin" className="btn-primary">
              🏠 Go to Check-In
            </a>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default App
