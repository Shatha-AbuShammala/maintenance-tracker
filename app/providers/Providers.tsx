"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = useCallback((value: string | null) => {
    setTokenState(value);
    if (typeof window === "undefined") return;

    if (value) localStorage.setItem("token", value);
    else localStorage.removeItem("token");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, [setToken]);

  const fetchCurrentUser = useCallback(
    async (authToken: string) => {
      try {
        const { data } = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Mapping _id → id
        const mappedUser: User = {
          id: data._id,
          email: data.email,
          name: data.name,
          role: data.role,
        };

        setUser(mappedUser);
      } catch {
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;
      setTokenState(storedToken);
      await fetchCurrentUser(storedToken);
    };
    init();
  }, [fetchCurrentUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      setUser,
      setToken,
      logout,
    }),
    [user, token, setToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Provider");
  return context;
};

export const useApiFetcher = () => {
  const { token } = useAuth();

  return useCallback(
    async <T,>(config: AxiosRequestConfig) => {
      const response = await axios.request<T>({
        baseURL: "/api",
        ...config,
        headers: {
          ...(config.headers ?? {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    },
    [token]
  );
};

type ProviderProps = {
  children: ReactNode;
};

const Provider = ({ children }: ProviderProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

export default Provider;
