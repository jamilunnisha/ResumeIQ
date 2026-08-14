import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// ==========================================
// GET AUTH TOKEN
// ==========================================

const getAuthToken = () => {
  return (
    localStorage.getItem("resumeiq_token") ||
    sessionStorage.getItem("resumeiq_token")
  );
};

// ==========================================
// REQUEST INTERCEPTOR
// Automatically adds JWT token
// ==========================================

API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// Handle expired / invalid sessions
// ==========================================

API.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "Authentication expired or missing."
      );

      localStorage.removeItem(
        "resumeiq_token"
      );

      sessionStorage.removeItem(
        "resumeiq_token"
      );
    }

    return Promise.reject(error);
  }
);

export default API;