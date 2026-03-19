import { useEffect, useState } from "react";
import api, { login, logout, me } from "../api/api";
import AuthContext from "../hook/useAuth";

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loginUser = async (credentials) => {
    try {
      const res = await login(credentials);
      setAuthToken(res.data.token);
      const userData = await me();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      setIsAuthenticated(false);
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const startTime = Date.now();
      try {
        const res = await api.post("auth/refresh");

        const token = res.data.data.token;

        setAuthToken(token);

        const userRes = await me();

        setUser(userRes);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        const elapsed = Date.now() - startTime;
        const minDuration = 3000;
        const remaining = minDuration - elapsed;

        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
        // setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const res = await api.post("auth/refresh");

            const token = res.data.data.token;

            setAuthToken(token);

            return api(originalRequest);
          } catch (refreshError) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loginUser,
        logoutUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
