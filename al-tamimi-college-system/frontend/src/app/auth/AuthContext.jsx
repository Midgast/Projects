import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("altamimi_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("altamimi_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("altamimi_token", token);
    else localStorage.removeItem("altamimi_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("altamimi_user", JSON.stringify(user));
    else localStorage.removeItem("altamimi_user");
  }, [user]);

  async function login(email, password) {
    const data = await apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
}
