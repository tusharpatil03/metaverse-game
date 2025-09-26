import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'user' as 'admin' | 'user',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await signup(
        formData.username, 
        formData.password, 
        formData.type,
        formData.email || undefined
      );
      navigate('/game'); // Redirect to game page after successful signup
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // Handle different error types
      if (error.response?.status === 409) {
        setErrors({ general: 'Username already exists. Please choose a different one.' });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Please check your input and try again';
        setErrors({ general: errorMessage });
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setErrors({ general: 'Unable to connect to server. Please try again later.' });
      } else {
        setErrors({ general: 'Signup failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Join the Metaverse</h1>
        <p className={styles.subtitle}>Create your account to get started</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorBox}>{errors.general}</div>
          )}
          
          <div className={styles.formGroup}>
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
              placeholder="Choose a username"
              disabled={isSubmitting}
            />
            {errors.username && (
              <span className={styles.errorMessage}>{errors.username}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Account Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`${styles.select} ${errors.type ? styles.inputError : ''}`}
              disabled={isSubmitting}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.type && (
              <span className={styles.errorMessage}>{errors.type}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email (optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Create a password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Confirm your password"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <span className={styles.errorMessage}>{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
