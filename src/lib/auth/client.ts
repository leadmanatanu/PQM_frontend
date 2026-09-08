import axios from 'axios';
import type { User } from '../../types/user';

const API_URL = 'http://localhost:5135/api/auth';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      const { data } = await axios.post(`${API_URL}/signup`, {
        email: params.email,
        password: params.password,
      });
      localStorage.setItem('custom-auth-token', data.token);
      return {};
    } catch (err: any) {
      return { error: err.response?.data?.error || 'Failed to sign up' };
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const { data } = await axios.post(`${API_URL}/signin`, {
        email: params.email,
        password: params.password,
      });
      localStorage.setItem('custom-auth-token', data.token);
      return {};
    } catch (err: any) {
      return { error: err.response?.data?.error || 'Invalid credentials' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { data: null };
    }
    try {
      const { data } = await axios.get(`${API_URL}/me`, {
        params: { token },
      });
      return { data };
    } catch (err: any) {
      localStorage.removeItem('custom-auth-token');
      return { data: null };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    return {};
  }
}

export const authClient = new AuthClient();
