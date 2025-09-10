const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  membershipType?: string;
}

// interface ApiResponse<T = any> {
//   data?: T;
//   error?: string;
//   message?: string;
// }

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('gymToken');
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
    // Store token and user data
    localStorage.setItem('gymToken', response.token);
    localStorage.setItem('gymUser', JSON.stringify(response.user));

    return response;
  }

  async login(credentials: { email: string; password: string }) {
      const response = await this.request<{ token: string; user: User }>('/auth/login', {

      method: 'POST',
      body: JSON.stringify(credentials),
    });

    localStorage.setItem('gymToken', response.token);
    localStorage.setItem('gymUser', JSON.stringify(response.user));

    return response;
  }

  async verifyToken() {
    try {
        const response = await this.request<{ user: User }>('/auth/verify');

      localStorage.setItem('gymUser', JSON.stringify(response.user));
      return response;
    } catch (error) {
      // Invalid token, clear storage
      this.logout();
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('gymToken');
    localStorage.removeItem('gymUser');
  }

  // Attendance methods
  async checkIn(sessionType?: string) {
    const response = await this.request('/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify({ sessionType }),
    });
    return response;
  }

  async checkOut() {
    const response = await this.request('/attendance/checkout', {
      method: 'POST',
    });
    return response;
  }

  async getAttendanceHistory(limit = 30, offset = 0) {
    const response = await this.request(`/attendance/history?limit=${limit}&offset=${offset}`);
    return response;
  }

  async getCurrentStatus() {
    const response = await this.request('/attendance/status');
    return response;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('gymUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiService = new ApiService();
export default apiService;