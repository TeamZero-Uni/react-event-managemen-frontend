import { useEffect, useLayoutEffect, useState } from "react";
import api, { login, logout, me } from "../api/api";
import AuthContext from "../hook/useAuth";

let token = null;
let refreshPromise = null;

export const setAuthToken = (t) => {
  token = t;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const resetAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  };

  useLayoutEffect(() => {
    const req = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const res = api.interceptors.response.use(
      (r) => r,
      async (err) => {
        const original = err.config;
        if (!original) return Promise.reject(err);

        if (original.url?.includes("auth/refresh")) {
          resetAuth();
          return Promise.reject(err);
        }

        if (err.response?.status === 401 && !original._retry) {
          original._retry = true;

          try {
            if (!refreshPromise) {
              refreshPromise = api
                .post("auth/refresh")
                .then((r) => setAuthToken(r.data.data.token))
                .finally(() => (refreshPromise = null));
            }

            await refreshPromise;
            return api(original);
          } catch (e) {
            resetAuth();
            window.location.href = "/auth/login";
            return Promise.reject(e);
          }
        }

        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(req);
      api.interceptors.response.eject(res);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const r = await api.post("auth/refresh");
        setAuthToken(r.data.data.token);
        const u = await me();

        if (!mounted) return;

        setUser(u);
        setIsAuthenticated(true);
      } catch (e) {
        if (!mounted) return;
        resetAuth();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const loginUser = async (cred) => {
    try {
      const r = await login(cred);
      setAuthToken(r.data.token);

      const u = await me();
      setUser(u);
      setIsAuthenticated(true);
    } catch (e) {
      resetAuth();
      throw e;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
    } finally {
      resetAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loginUser, logoutUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};