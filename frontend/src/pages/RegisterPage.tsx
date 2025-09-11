import { useState } from 'react'
import type { RegisterRequest } from '../types'
import apiService from '../services/api'

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    membershipType: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Real API call for registration
      await apiService.register(formData)

      localStorage.setItem('gymPreferences', JSON.stringify({
        autoCheckIn: true,
        notifications: true,
        theme: 'light',
        lastRegistered: new Date().toISOString()
      }))
      
      // Redirect to check-in page for immediate check-in
      window.location.href = '/checkin'

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
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
            🏋️ Join Fairford Gym
          </h1>
          <p className="text-gray-600">
            Quick registration to get started
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                  {profileImage ? (
                    <img 
                      src={URL.createObjectURL(profileImage)} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-2xl">📸</span>
                  )}
                </div>
                <label className="cursor-pointer text-sm text-primary-600 hover:underline">
                  Add Photo (Optional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="Chike"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="Boyega"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                placeholder="chike@olympus.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Membership Type
              </label>
              <select
                name="membershipType"
                value={formData.membershipType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select membership type</option>
                <option value="basic">Basic Monthly - ₦17,000/month</option>
                <option value="premium">Premium Monthly - ₦37,000/month</option>
                <option value="annual">Annual Membership - ₦200,000/year</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg disabled:opacity-50"
            >
              {isLoading ? '🔄 Creating Account...' : '✅ Create Account & Check In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-primary-600 hover:underline font-semibold">
                Sign in here
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}