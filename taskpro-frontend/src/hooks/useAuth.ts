import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loginUser, registerUser, logoutUser, clearError } from '../store/slices/authSlice';
import { LoginCredentials, RegisterData } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Clear any previous errors before attempting login
      dispatch(clearError());
      
      const result = await dispatch(loginUser(credentials)).unwrap();
      toast.success('Login success !');
      navigate('/dashboard');
      return result;
    } catch (error: any) {
      // L'erreur vient déjà formatée du service auth
      let errorMessage = 'Unknown login error';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }
      
      console.log('Login error in useAuth:', errorMessage);
      toast.error(errorMessage);
      
      // DON'T throw the error - this can cause page refresh
      return false;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      // Clear any previous errors before attempting registration
      dispatch(clearError());
      
      const result = await dispatch(registerUser(userData)).unwrap();
      toast.success('Registration success ! Check your email.');
      navigate(`/account-activation?email=${encodeURIComponent(userData.email)}`);
      return result;
    } catch (error: any) {
      let errorMessage = 'Error during registration';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const activateAccount = async (token: string) => {
    try {
      await authService.activateAccount(token);
      toast.success('Account activated successfully !');
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Error during activation";
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logout success');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    // État
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    activateAccount,
    clearAuthError,
  };
};

