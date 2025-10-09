import api from './api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth.types';

// Map backend UserBasicDTO -> frontend User
function mapUserBasicToUser(dto: { id: number; firstname?: string; lastname?: string; email: string }): User {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstname,
    lastName: dto.lastname,
    // Optional fields left undefined; can be enriched later
  } as User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Backend expects { email, password } - direct mapping now
      const body = { email: credentials.email, password: credentials.password };
      // Backend returns token string (envelope already unwrapped by axios interceptor)
      const { data: token } = await api.post<string>('/auth/login', body);

      // Temporarily store token for the next request
      const oldToken = localStorage.getItem('token');
      localStorage.setItem('token', token);

      try {
        // Fetch current user profile with the new token
        const { data: me } = await api.get<{ id: number; firstname?: string; lastname?: string; email: string }>(
          '/users/me'
        );
        const user = mapUserBasicToUser(me);

        return { token, user };
      } catch (userError) {
        // Restore old token if user fetch fails
        if (oldToken) {
          localStorage.setItem('token', oldToken);
        } else {
          localStorage.removeItem('token');
        }
        throw new Error('Error retrieving user profile');
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        switch (status) {
          case 401:
            throw new Error('Email or password incorrect');
          case 403:
            throw new Error('Account not activated. Check your email.');
          case 404:
            throw new Error('Account not found');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(message || 'Login error');
        }
      }
      throw new Error('Connection problem. Check your internet connection.');
    }
  },

  async getCurrentUser(): Promise<User> {
    const { data: me } = await api.get<{ id: number; firstname?: string; lastname?: string; email: string }>(
      '/users/me'
    );
    return mapUserBasicToUser(me);
  },

  async register(payload: RegisterData): Promise<void> {
    // Map frontend RegisterData -> backend RegisterRequest
    const body = {
      firstname: payload.firstName,
      lastname: payload.lastName,
      email: payload.email,
      password: payload.password,
      dateOfBirth: payload.dateOfBirth,
    };
    await api.post('/auth/register', body);
  },

  async activateAccount(token: string): Promise<void> {
    await api.get(`/auth/activate-account?token=${token}`);
  },
};


