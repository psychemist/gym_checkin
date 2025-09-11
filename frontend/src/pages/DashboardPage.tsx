import { useState, useEffect } from 'react'
import apiService from '../services/api'

interface DashboardStats {
  totalWorkouts: number
  thisMonth: number
  currentStreak: number
  longestStreak: number
  averageSessionLength: number
  favoriteTimeSlot: string
  monthlyGoal: number
  monthlyProgress: number
}

interface RecentAttendance {
  id: string
  checkInTime: string
  checkOutTime?: string
  sessionType: string
  duration?: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    thisMonth: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionLength: 0,
    favoriteTimeSlot: 'MORNING',
    monthlyGoal: 12,
    monthlyProgress: 0
  })
  const [recentAttendance, setRecentAttendance] = useState<RecentAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'goals' | 'profile'>('overview')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Get user info
      const userInfo = apiService.getCurrentUser()
      setUser(userInfo)
      
      // Get attendance history and stats
      const historyResponse = await apiService.getAttendanceHistory(50)
      setRecentAttendance(historyResponse.attendances.slice(0, 10))
      
      // Calculate enhanced stats
      const attendances = historyResponse.attendances
      const now = new Date()
      const thisMonth = attendances.filter(a => {
        const checkIn = new Date(a.checkInTime)
        return checkIn.getMonth() === now.getMonth() && checkIn.getFullYear() === now.getFullYear()
      }).length

      // Calculate longest streak
      let longestStreak = 0
      let currentStreak = 0
      const sortedAttendances = attendances.sort((a, b) => 
        new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
      )

      for (let i = 0; i < sortedAttendances.length; i++) {
        const checkInDate = new Date(sortedAttendances[i].checkInTime)
        const daysDiff = Math.floor((now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= i + 1) {
          currentStreak++
          longestStreak = Math.max(longestStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      }

      // Calculate average session length
      const sessionsWithDuration = attendances.filter(a => a.checkOutTime)
      const averageSessionLength = sessionsWithDuration.length > 0 
        ? sessionsWithDuration.reduce((sum, a) => {
            const duration = new Date(a.checkOutTime!).getTime() - new Date(a.checkInTime).getTime()
            return sum + (duration / (1000 * 60))
          }, 0) / sessionsWithDuration.length
        : 0

      // Determine favorite time slot
      const morningCount = attendances.filter(a => a.sessionType === 'MORNING').length
      const eveningCount = attendances.filter(a => a.sessionType === 'EVENING').length
      const favoriteTimeSlot = morningCount > eveningCount ? 'MORNING' : 'EVENING'

      setStats({
        totalWorkouts: attendances.length,
        thisMonth,
        currentStreak: historyResponse.stats.currentStreak,
        longestStreak,
        averageSessionLength: Math.round(averageSessionLength),
        favoriteTimeSlot,
        monthlyGoal: 12,
        monthlyProgress: Math.round((thisMonth / 12) * 100)
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                👋 Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 text-sm">Here's your fitness journey overview</p>
            </div>
            <button 
              onClick={() => window.location.href = '/checkin'}
              className="btn-primary"
            >
              🚀 Quick Check-In
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="card mb-6">
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'history', label: '📅 History', icon: '📅' },
              { id: 'goals', label: '🎯 Goals', icon: '🎯' },
              { id: 'profile', label: '👤 Profile', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.totalWorkouts}</div>
                <div className="text-sm text-gray-600">Total Workouts</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-gym-green">{stats.thisMonth}</div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-gym-orange">{stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-500">{stats.averageSessionLength}m</div>
                <div className="text-sm text-gray-600">Avg Session</div>
              </div>
            </div>

            {/* Monthly Progress */}
            <div className="card">
              <h3 className="gym-header">Monthly Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Goal: {stats.monthlyGoal} workouts</span>
                  <span className="text-sm text-gray-600">{stats.thisMonth}/{stats.monthlyGoal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.monthlyProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {stats.monthlyProgress >= 100 ? '🎉 Goal achieved!' : `${100 - stats.monthlyProgress}% to go`}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="gym-header">Recent Activity</h3>
              <div className="space-y-2">
                {recentAttendance.slice(0, 5).map((attendance) => (
                  <div key={attendance.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-sm">
                        {attendance.sessionType === 'MORNING' ? '☀️' : '🌙'} {attendance.sessionType.toLowerCase()} session
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(attendance.checkInTime)}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {attendance.checkOutTime ? `${Math.round((new Date(attendance.checkOutTime).getTime() - new Date(attendance.checkInTime).getTime()) / (1000 * 60))}m` : 'Active'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="card">
            <h3 className="gym-header">Workout History</h3>
            <div className="space-y-3">
              {recentAttendance.map((attendance) => (
                <div key={attendance.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {attendance.sessionType === 'MORNING' ? '☀️' : '🌙'}
                    </div>
                    <div>
                      <div className="font-medium">{attendance.sessionType.toLowerCase()} Session</div>
                      <div className="text-sm text-gray-600">{formatDate(attendance.checkInTime)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {attendance.checkOutTime 
                        ? `${Math.round((new Date(attendance.checkOutTime).getTime() - new Date(attendance.checkInTime).getTime()) / (1000 * 60))} min`
                        : 'In Progress'
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {attendance.checkOutTime ? 'Completed' : 'Active'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="gym-header">Monthly Goals</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">Workout Frequency</div>
                    <div className="text-sm text-gray-600">Visit the gym {stats.monthlyGoal} times this month</div>
                  </div>
                  <div className="text-2xl">
                    {stats.monthlyProgress >= 100 ? '✅' : '🎯'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">Consistency</div>
                    <div className="text-sm text-gray-600">Maintain a {stats.currentStreak}+ day streak</div>
                  </div>
                  <div className="text-2xl">
                    {stats.currentStreak >= 7 ? '🔥' : '⏰'}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="gym-header">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🎯', title: 'First Workout', description: 'Complete your first session', achieved: stats.totalWorkouts > 0 },
                  { icon: '🔥', title: 'Week Warrior', description: '7-day streak', achieved: stats.longestStreak >= 7 },
                  { icon: '💪', title: 'Monthly Master', description: '12 workouts in a month', achieved: stats.thisMonth >= 12 },
                  { icon: '⭐', title: 'Gym Regular', description: '50 total workouts', achieved: stats.totalWorkouts >= 50 }
                ].map((achievement, index) => (
                  <div key={index} className={`p-3 rounded-lg border-2 ${achievement.achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="gym-header">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-primary-600">👤</span>
                  </div>
                  <div>
                    <div className="font-medium text-lg">{user?.firstName} {user?.lastName}</div>
                    <div className="text-gray-600">{user?.email}</div>
                    {user?.membershipType && (
                      <div className="text-sm text-primary-600 capitalize">{user.membershipType} Member</div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Member Since</div>
                    <div className="text-sm text-gray-600">{new Date(user?.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Favorite Time</div>
                    <div className="text-sm text-gray-600">
                      {stats.favoriteTimeSlot === 'MORNING' ? '☀️ Morning' : '🌙 Evening'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="gym-header">Preferences</h3>
              <div className="space-y-3">
                {[
                  { label: 'Auto Check-in', description: 'Automatically check in when you arrive', enabled: true },
                  { label: 'Notifications', description: 'Get reminders and updates', enabled: true },
                  { label: 'Weekly Summary', description: 'Receive weekly progress emails', enabled: false }
                ].map((pref, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{pref.label}</div>
                      <div className="text-xs text-gray-600">{pref.description}</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full flex items-center ${pref.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${pref.enabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}