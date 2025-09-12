// Persistent Storage Strategy
// Comprehensive storage management for user data, preferences, and offline functionality

interface UserPreferences {
  autoCheckIn: boolean
  notifications: boolean
  theme: 'light' | 'dark'
  reminderTime?: string
  weeklyGoal: number
  monthlyGoal: number
  favoriteWorkoutTimes: string[]
  lastLogin?: string
  lastRegistered?: string
  rememberLogin: boolean
}

interface CachedUserData {
  user: any
  lastSync: string
  isOffline: boolean
}

interface OfflineAction {
  id: string
  type: 'checkin' | 'checkout' | 'update_profile'
  data: any
  timestamp: string
  synced: boolean
}

class StorageService {
  private readonly STORAGE_KEYS = {
    // Authentication & Sessions
    AUTH_TOKEN: 'gymToken',
    USER_DATA: 'gymUser',
    SAVED_EMAILS: 'gymSavedEmails',
    
    // User Preferences
    PREFERENCES: 'gymPreferences',
    THEME_SETTINGS: 'gymTheme',
    
    // Offline Support
    OFFLINE_ACTIONS: 'gymOfflineActions',
    CACHED_DATA: 'gymCachedData',
    LAST_SYNC: 'gymLastSync',
    
    // App State
    APP_SETTINGS: 'gymAppSettings',
    ONBOARDING_COMPLETE: 'gymOnboardingComplete'
  }

  // Authentication Storage
  setAuthToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEYS.AUTH_TOKEN, token)
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.AUTH_TOKEN)
  }

  setUserData(user: any): void {
    const userData: CachedUserData = {
      user,
      lastSync: new Date().toISOString(),
      isOffline: !navigator.onLine
    }
    localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
  }

  getUserData(): any | null {
    const stored = localStorage.getItem(this.STORAGE_KEYS.USER_DATA)
    if (!stored) return null
    
    try {
      const parsed: CachedUserData = JSON.parse(stored)
      return parsed.user
    } catch {
      return null
    }
  }

  // Enhanced Preferences Management
  setUserPreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getUserPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem(this.STORAGE_KEYS.PREFERENCES, JSON.stringify(updated))
  }

  getUserPreferences(): UserPreferences {
    const stored = localStorage.getItem(this.STORAGE_KEYS.PREFERENCES)
    const defaultPreferences: UserPreferences = {
      autoCheckIn: true,
      notifications: true,
      theme: 'light',
      weeklyGoal: 3,
      monthlyGoal: 12,
      favoriteWorkoutTimes: [],
      rememberLogin: true
    }

    if (!stored) return defaultPreferences

    try {
      return { ...defaultPreferences, ...JSON.parse(stored) }
    } catch {
      return defaultPreferences
    }
  }

  // Saved Emails for Quick Login
  addSavedEmail(email: string): void {
    const saved = this.getSavedEmails()
    const updated = [email, ...saved.filter(e => e !== email)].slice(0, 5)
    localStorage.setItem(this.STORAGE_KEYS.SAVED_EMAILS, JSON.stringify(updated))
  }

  getSavedEmails(): string[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SAVED_EMAILS)
    return stored ? JSON.parse(stored) : []
  }

  removeSavedEmail(email: string): void {
    const saved = this.getSavedEmails().filter(e => e !== email)
    localStorage.setItem(this.STORAGE_KEYS.SAVED_EMAILS, JSON.stringify(saved))
  }

  // Offline Actions Queue
  addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): void {
    const actions = this.getOfflineActions()
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      synced: false
    }
    
    actions.push(newAction)
    localStorage.setItem(this.STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(actions))
  }

  getOfflineActions(): OfflineAction[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.OFFLINE_ACTIONS)
    return stored ? JSON.parse(stored) : []
  }

  markActionAsSynced(actionId: string): void {
    const actions = this.getOfflineActions().map(action =>
      action.id === actionId ? { ...action, synced: true } : action
    )
    localStorage.setItem(this.STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(actions))
  }

  clearSyncedActions(): void {
    const actions = this.getOfflineActions().filter(action => !action.synced)
    localStorage.setItem(this.STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(actions))
  }

  // Cache Management
  setCachedData(key: string, data: any, ttl: number = 3600000): void { // 1 hour default TTL
    const cached = {
      data,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(`gymCache_${key}`, JSON.stringify(cached))
  }

  getCachedData(key: string): any | null {
    const stored = localStorage.getItem(`gymCache_${key}`)
    if (!stored) return null

    try {
      const cached = JSON.parse(stored)
      const now = Date.now()
      
      if (now - cached.timestamp > cached.ttl) {
        // Cache expired
        localStorage.removeItem(`gymCache_${key}`)
        return null
      }
      
      return cached.data
    } catch {
      return null
    }
  }

  // App State Management
  setAppSetting(key: string, value: any): void {
    const settings = this.getAppSettings()
    settings[key] = value
    localStorage.setItem(this.STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings))
  }

  getAppSetting(key: string, defaultValue: any = null): any {
    const settings = this.getAppSettings()
    return settings[key] !== undefined ? settings[key] : defaultValue
  }

  private getAppSettings(): Record<string, any> {
    const stored = localStorage.getItem(this.STORAGE_KEYS.APP_SETTINGS)
    return stored ? JSON.parse(stored) : {}
  }

  // Onboarding & First-time Experience
  setOnboardingComplete(): void {
    localStorage.setItem(this.STORAGE_KEYS.ONBOARDING_COMPLETE, 'true')
  }

  isOnboardingComplete(): boolean {
    return localStorage.getItem(this.STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true'
  }

  // Data Synchronization
  setLastSyncTime(): void {
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
  }

  getLastSyncTime(): Date | null {
    const stored = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC)
    return stored ? new Date(stored) : null
  }

  // Storage Cleanup
  clearUserData(): void {
    // Clear all user-specific data but keep app preferences
    localStorage.removeItem(this.STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(this.STORAGE_KEYS.USER_DATA)
    localStorage.removeItem(this.STORAGE_KEYS.OFFLINE_ACTIONS)
    localStorage.removeItem(this.STORAGE_KEYS.CACHED_DATA)
    localStorage.removeItem(this.STORAGE_KEYS.LAST_SYNC)
    
    // Clear all cache entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gymCache_')) {
        localStorage.removeItem(key)
      }
    })
  }

  clearAllData(): void {
    // Nuclear option - clear everything
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear all cache entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gym')) {
        localStorage.removeItem(key)
      }
    })
  }

  // Storage Analytics
  getStorageUsage(): { used: number; total: number; percentage: number } {
    const used = JSON.stringify(localStorage).length
    const total = 5 * 1024 * 1024 // 5MB typical localStorage limit
    return {
      used,
      total,
      percentage: Math.round((used / total) * 100)
    }
  }

  // Data Export/Import for backup
  exportUserData(): string {
    const data = {
      preferences: this.getUserPreferences(),
      savedEmails: this.getSavedEmails(),
      appSettings: this.getAppSettings(),
      exportDate: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }

  importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.preferences) this.setUserPreferences(data.preferences)
      if (data.savedEmails) {
        localStorage.setItem(this.STORAGE_KEYS.SAVED_EMAILS, JSON.stringify(data.savedEmails))
      }
      if (data.appSettings) {
        localStorage.setItem(this.STORAGE_KEYS.APP_SETTINGS, JSON.stringify(data.appSettings))
      }
      
      return true
    } catch {
      return false
    }
  }
}

export const storageService = new StorageService()
export default storageService

// Offline Detection and Sync Management
export class OfflineSyncManager {
  private syncInProgress = false

  constructor(private apiService: any, private storageService: StorageService) {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  private handleOnline(): void {
    console.log('🌐 Back online - syncing offline actions...')
    this.syncOfflineActions()
  }

  private handleOffline(): void {
    console.log('📴 Gone offline - actions will be queued')
  }

  async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return

    this.syncInProgress = true
    const actions = this.storageService.getOfflineActions().filter(a => !a.synced)

    try {
      for (const action of actions) {
        await this.syncAction(action)
        this.storageService.markActionAsSynced(action.id)
      }
      
      this.storageService.clearSyncedActions()
      this.storageService.setLastSyncTime()
      console.log(`✅ Synced ${actions.length} offline actions`)
      
    } catch (error) {
      console.error('❌ Failed to sync offline actions:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async syncAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'checkin':
        await this.apiService.checkIn(action.data.sessionType)
        break
      case 'checkout':
        await this.apiService.checkOut()
        break
      case 'update_profile':
        // Future implementation
        break
    }
  }

  queueOfflineAction(type: OfflineAction['type'], data: any): void {
    this.storageService.addOfflineAction({ type, data })
    console.log(`📝 Queued offline action: ${type}`)
  }
}

export type { UserPreferences, OfflineAction }