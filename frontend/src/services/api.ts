import storageService, { OfflineSyncManager } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  membershipType?: string;
}

class ApiService {
  private offlineSyncManager: OfflineSyncManager

  constructor() {
    this.offlineSyncManager = new OfflineSyncManager(this, storageService)
  }

  private getToken(): string | null {
    return storageService.getAuthToken()
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Phase 3.3 - Check if we're offline and handle accordingly
    if (!navigator.onLine) {
      throw new Error('You are currently offline. Action will be synced when connection is restored.')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
  }

  // Authentication methods with Phase 3.3 storage integration
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    membershipType?: string;
  }) {
    const response = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Phase 3.3 - Use storage service for token and user data
    storageService.setAuthToken(response.token)
    storageService.setUserData(response.user)
    
    // Phase 3.1 & 3.3 - Save email for quick access and set preferences
    const preferences = storageService.getUserPreferences()
    storageService.addSavedEmail(userData.email)
    storageService.setUserPreferences({
      ...preferences,
      lastRegistered: new Date().toISOString()
    })

    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Phase 3.3 - Use storage service
    storageService.setAuthToken(response.token)
    storageService.setUserData(response.user)
    storageService.addSavedEmail(credentials.email)
    
    // Update last login time
    const preferences = storageService.getUserPreferences()
    storageService.setUserPreferences({
      ...preferences,
      lastLogin: new Date().toISOString()
    })

    return response;
  }

  async verifyToken() {
    try {
      const response = await this.request<{ user: User }>('/auth/verify');
      storageService.setUserData(response.user)
      return response;
    } catch (error) {
      // Invalid token, clear storage
      this.logout();
      throw error;
    }
  }

  logout() {
    storageService.clearUserData()
  }

  // Phase 3.3 - Enhanced attendance methods with offline support
  async checkIn(sessionType?: string) {
    try {
      const response = await this.request('/attendance/checkin', {
        method: 'POST',
        body: JSON.stringify({ sessionType }),
      });
      
      // Cache the successful check-in
      storageService.setCachedData('lastCheckIn', response, 86400000) // 24 hours
      return response;
      
    } catch (error) {
      if (!navigator.onLine) {
        // Queue for offline sync
        this.offlineSyncManager.queueOfflineAction('checkin', { sessionType })
        throw new Error('Offline check-in queued. Will sync when connection is restored.')
      }
      throw error;
    }
  }

  async checkOut() {
    try {
      const response = await this.request('/attendance/checkout', {
        method: 'POST',
      });
      
      storageService.setCachedData('lastCheckOut', response, 86400000)
      return response;
      
    } catch (error) {
      if (!navigator.onLine) {
        this.offlineSyncManager.queueOfflineAction('checkout', {})
        throw new Error('Offline check-out queued. Will sync when connection is restored.')
      }
      throw error;
    }
  }

  async getAttendanceHistory(limit = 30, offset = 0) {
    try {
      const response = await this.request(`/attendance/history?limit=${limit}&offset=${offset}`);
      
      // Cache attendance history
      storageService.setCachedData('attendanceHistory', response, 300000) // 5 minutes
      return response;
      
    } catch (error) {
      // Try to return cached data if offline
      if (!navigator.onLine) {
        const cached = storageService.getCachedData('attendanceHistory')
        if (cached) {
          console.log('📱 Using cached attendance history (offline)')
          return cached
        }
      }
      throw error;
    }
  }

  async getCurrentStatus() {
    try {
      const response = await this.request('/attendance/status');
      storageService.setCachedData('currentStatus', response, 60000) // 1 minute
      return response;
      
    } catch (error) {
      if (!navigator.onLine) {
        const cached = storageService.getCachedData('currentStatus')
        if (cached) {
          console.log('📱 Using cached status (offline)')
          return cached
        }
      }
      throw error;
    }
  }

  // Phase 3.3 - Utility methods enhanced with storage service
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    return storageService.getUserData()
  }

  // Phase 3.3 - Storage management methods
  getUserPreferences() {
    return storageService.getUserPreferences()
  }

  updateUserPreferences(preferences: any) {
    storageService.setUserPreferences(preferences)
  }

  getSavedEmails() {
    return storageService.getSavedEmails()
  }

  getStorageUsage() {
    return storageService.getStorageUsage()
  }

  exportUserData() {
    return storageService.exportUserData()
  }

  // Phase 3.3 - Sync management
  async syncOfflineActions() {
    await this.offlineSyncManager.syncOfflineActions()
  }

  getOfflineActions() {
    return storageService.getOfflineActions()
  }
}

export const apiService = new ApiService();
export default apiService;