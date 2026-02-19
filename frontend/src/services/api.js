/**
 * Axios HTTP client for the FastAPI backend.
 *
 * Configured with base URL from environment, auth header
 * interceptors, and centralized error handling.
 */

import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach API key header.
api.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem("api_key");
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: centralized error handling.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        console.error("Authentication failed. Check your API key.");
      } else if (status === 429) {
        console.error("Rate limit exceeded. Please slow down.");
      } else if (status >= 500) {
        console.error("Server error:", data?.detail || "Unknown error");
      }
    } else if (error.request) {
      console.error("Network error: no response received");
    }
    return Promise.reject(error);
  }
);

export default api;
