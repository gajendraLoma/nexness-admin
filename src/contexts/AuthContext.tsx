import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { userApi, type User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    const res = await userApi.me();
    if (res.success && res.user) {
      if ((res.user as User).role === "admin") setUser(res.user as User);
      else {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const { auth } = await import("@/lib/api");
    const res = await auth.login(email, password);
    if (res.success && res.token && res.user) {
      const u = res.user as User;
      if (u.role !== "admin") {
        return { success: false, message: "Admin account required" };
      }
      localStorage.setItem("token", res.token);
      setToken(res.token);
      setUser(u);
      return { success: true };
    }
    return { success: false, message: (res as { message?: string }).message || "Login failed" };
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
