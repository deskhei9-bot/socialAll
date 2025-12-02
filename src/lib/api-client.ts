// Self-hosted API Client
// Replaces Supabase client with our own backend API

const API_URL = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on init
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }

  // Authentication methods
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });

    if (data && !error) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data && !error) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return { data, error };
  }

  async signOut() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<{ data: User | null; error: Error | null }> {
    if (!this.token) {
      return { data: null, error: null };
    }

    return await this.request<User>('/auth/me');
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    if (!this.token) {
      return { valid: false };
    }

    const { data, error } = await this.request<{ valid: boolean; user: User }>('/auth/verify', {
      method: 'POST',
    });

    if (error || !data?.valid) {
      this.signOut(); // Clear invalid token
      return { valid: false };
    }

    return { valid: true, user: data.user };
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.getStoredUser();
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) {
        return { data: null, error: new Error('Health check failed') };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  // Posts methods
  async getPosts() {
    return await this.request('/posts');
  }

  async getPost(id: string) {
    return await this.request(`/posts/${id}`);
  }

  async createPost(postData: {
    title?: string;
    content?: string;
    platforms?: string[];
    status?: string;
    scheduled_for?: string;
    media_url?: string;
    media_type?: string;
    metadata?: any;
  }) {
    return await this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: string, postData: any) {
    return await this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: string) {
    return await this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Channels methods
  async getChannels() {
    return await this.request('/channels');
  }

  async addChannel(channelData: {
    platform: string;
    account_name: string;
    account_handle?: string;
    followers_count?: number;
    access_token: string;
    refresh_token?: string;
    token_expires_at?: string;
  }) {
    return await this.request('/channels', {
      method: 'POST',
      body: JSON.stringify(channelData),
    });
  }

  async updateChannel(id: string, channelData: any) {
    return await this.request(`/channels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(channelData),
    });
  }

  async deleteChannel(id: string) {
    return await this.request(`/channels/${id}`, {
      method: 'DELETE',
    });
  }

  async refreshChannelToken(id: string) {
    return await this.request(`/channels/${id}/refresh`, {
      method: 'POST',
    });
  }

  // Users methods
  async getUsers() {
    return await this.request('/users');
  }

  async updateUserProfile(data: { fullName?: string; email?: string }) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return await this.request('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Upload methods
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Upload failed') 
      };
    }
  }

  async uploadMultipleFiles(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_URL}/upload/multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Upload failed') 
      };
    }
  }

  async getUploadedMedia() {
    return await this.request('/upload/media');
  }

  async deleteMedia(id: string) {
    return await this.request(`/upload/media/${id}`, {
      method: 'DELETE',
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
