import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { User, LoginCredentials, RegisterData } from '../../types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
      try {
         const response = await authService.login(credentials);
         localStorage.setItem('token', response.token);
         return response;
      } catch (error: any) {
        // L'erreur vient déjà formatée du service auth
        return rejectWithValue(error.message || 'Connection error');
      }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: RegisterData, { rejectWithValue }) => {
      try {
        const response = await authService.register(userData);
        return response;
      } catch (error: any) {
        // L'erreur vient déjà formatée du service auth
        return rejectWithValue(error.message || 'Registration failed');
      }
    }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  localStorage.removeItem('token');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
        // Login
        .addCase(loginUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        })
        .addCase(loginUser.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
          state.isAuthenticated = false;
        })
        // Register
        .addCase(registerUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(registerUser.fulfilled, (state) => {
          state.isLoading = false;
          state.error = null;
        })
        .addCase(registerUser.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })
        // Logout
        .addCase(logoutUser.fulfilled, (state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = null;
        });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;