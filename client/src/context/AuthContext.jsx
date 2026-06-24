import { useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import { AuthContext } from "./authContextDefinition";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return storedUser && token ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading] = useState(false);

  const persistSession = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    persistSession(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
