import axios from "axios";

export const TOKEN_KEY = "token";

// Paths that must never carry a token. The backend filter rejects an expired
// token on every route, including the public /auth ones, so a stale token
// would otherwise block logging in again.
const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

// In dev, "/api" goes through the Vite proxy. Set VITE_API_URL (e.g. in a production
// build) to call the backend directly, which is when CORS matters.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isPublic = PUBLIC_PATHS.some((p) => config.url?.startsWith(p));
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 while holding a token = expired or blacklisted. Clear it and go to login.
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);