import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    type: "user" as "admin" | "user",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      await login(formData.username, formData.password, formData.type);
      navigate("/game");
    } catch (error: any) {
      console.error("Login failed:", error);

      if (error.response?.status === 401) {
        setErrors({ general: "Invalid username or password" });
      } else if (error.response?.status === 400) {
        setErrors({ general: "Please check your input and try again" });
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        setErrors({
          general: "Unable to connect to server. Please try again later.",
        });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to enter the metaverse</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorBox}>{errors.general}</div>
          )}

          {/* Username */}
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={isSubmitting}
              className={`${styles.input} ${
                errors.username ? styles.inputError : ""
              }`}
            />
            {errors.username && (
              <span className={styles.errorMessage}>{errors.username}</span>
            )}
          </div>

          {/* Account Type */}
          <div className={styles.formGroup}>
            <label htmlFor="type">Account Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={isSubmitting}
              className={styles.select}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.type && (
              <span className={styles.errorMessage}>{errors.type}</span>
            )}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isSubmitting}
              className={`${styles.input} ${
                errors.password ? styles.inputError : ""
              }`}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.button}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={styles.footer}>
          Don’t have an account?{" "}
          <Link to="/signup" className={styles.link}>
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
