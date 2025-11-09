const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface EmailNotifications {
  enabled: boolean;
  focusDropAlerts: boolean;
  sessionSummaries: boolean;
  weeklyReports: boolean;
}

export interface User {
  _id: string;
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  totalSessions: number;
  totalFocusTime: number;
  emailNotifications?: EmailNotifications;
}

export interface FocusData {
  focusScore: number;
  focusLabel: 'Focused' | 'Losing Focus' | 'Distracted';
  aiMessage?: string;
  voiceUrl?: string;
}

export interface FocusDataPoint {
  timestamp: string;
  typingSpeed: number;
  idleTime: number;
  tabSwitches: number;
  focusScore: number;
  aiMessage?: string;
  voiceUrl?: string;
}

export interface FocusSession {
  _id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  averageFocusScore: number;
  maxFocusScore: number;
  minFocusScore: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  task?: string;
  mood?: string;
  focusDataPoints?: FocusDataPoint[];
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = error.error || `HTTP error! status: ${response.status}`;
      const httpError = new Error(errorMessage) as any;
      httpError.status = response.status;
      throw httpError;
    }

    return response.json();
  }

  // Auth endpoints
  async createOrGetUser(auth0Id: string, email: string, name: string, picture?: string): Promise<User> {
    return this.request<User>('/auth/user', {
      method: 'POST',
      body: JSON.stringify({ auth0Id, email, name, picture }),
    });
  }

  async getUser(auth0Id: string): Promise<User> {
    return this.request<User>(`/auth/user/${auth0Id}`);
  }

  // Focus tracking endpoints
  async trackFocus(
    userId: string,
    sessionId: string | null,
    typingSpeed: number,
    idleTime: number,
    tabSwitches: number
  ): Promise<FocusData> {
    return this.request<FocusData>('/focus/track', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        sessionId,
        typingSpeed,
        idleTime,
        tabSwitches,
      }),
    });
  }

  async getFocusHistory(userId: string, startDate?: string, endDate?: string, limit = 100) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/focus/history/${userId}?${params}`);
  }

  async getFocusAnalytics(userId: string, days = 7) {
    return this.request(`/focus/analytics/${userId}?days=${days}`);
  }

  // Session endpoints
  async createSession(userId: string, task?: string, mood?: string, duration?: number): Promise<FocusSession> {
    return this.request<FocusSession>('/sessions/create', {
      method: 'POST',
      body: JSON.stringify({ userId, task, mood, duration }),
    });
  }

  async getActiveSession(userId: string): Promise<FocusSession | null> {
    try {
      const result = await this.request<FocusSession | null>(`/sessions/active/${userId}`);
      // Backend returns null if no active session (200 status)
      return result;
    } catch (error: any) {
      // Fallback: handle 404 if backend still returns it
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Not Found') || error.message?.includes('No active session')) {
        return null;
      }
      throw error;
    }
  }

  async updateSession(sessionId: string, status?: string, duration?: number): Promise<FocusSession> {
    return this.request<FocusSession>(`/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, duration }),
    });
  }

  async endSession(sessionId: string): Promise<FocusSession> {
    return this.request<FocusSession>(`/sessions/${sessionId}/end`, {
      method: 'POST',
    });
  }

  async getSessionHistory(userId: string, limit = 10) {
    return this.request(`/sessions/history/${userId}?limit=${limit}`);
  }

  async getSession(sessionId: string): Promise<FocusSession> {
    return this.request<FocusSession>(`/sessions/${sessionId}`);
  }

  // User preferences
  async updateUserPreferences(userId: string, preferences: { emailNotifications?: EmailNotifications }) {
    return this.request<User>(`/auth/user/${userId}/preferences`, {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }
}

export const apiClient = new ApiClient();

