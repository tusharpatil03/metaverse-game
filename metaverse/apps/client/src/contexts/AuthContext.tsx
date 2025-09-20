import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email?: string;
  type?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, type?: 'admin' | 'user') => Promise<void>;
  signup: (username: string, password: string, type?: 'admin' | 'user', email?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Set axios base URL once
        axios.defaults.baseURL = API_BASE_URL;
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Set default axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    initializeAuth();
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string, type: 'admin' | 'user' = 'user'): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/signin`, {
        username,
        password,
        type,
      });

      const { token: authToken, userId } = response.data;
      
      // Create user object with available data
      const userData: User = {
        id: userId,
        username,
        type,
      };
      
      // Store in localStorage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      // Update state
      setToken(authToken);
      setUser(userData);
      
      // Set default axios header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (username: string, password: string, type: 'admin' | 'user' = 'user', email?: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/signup`, {
        username,
        password,
        type,
        ...(email && { email }),
      });

      const { token: authToken, userId } = response.data;
      
      // Create user object with available data
      const userData: User = {
        id: userId,
        username,
        type,
        ...(email && { email }),
      };
      
      // Store in localStorage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      // Update state
      setToken(authToken);
      setUser(userData);
      
      // Set default axios header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
