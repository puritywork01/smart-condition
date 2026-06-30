"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "Admin" | "Manager" | "Technician";

export interface User {
  id: string;
  username: string;
  role: Role;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for user session on mount
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Guard routes
  useEffect(() => {
    if (isLoading) return;
    
    if (!user && pathname !== "/login") {
      router.push("/login");
    } else if (user && pathname === "/login") {
      router.push("/");
    } else if (user && pathname === "/admin" && user.role !== "Admin") {
      // Only Admin can access admin page
      router.push("/");
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.role === "Admin") return true; // Admin has all permissions
    return user.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
