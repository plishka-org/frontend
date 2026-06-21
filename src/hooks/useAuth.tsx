/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  checkAuthStatus,
  clearClientAuthState,
  deleteAccountApi,
  loginApi,
  logoutApi,
  type AuthUser,
  type LoginCredentials,
} from "../services/api/authApi";
import { onAuthCleared } from '../services/api/client'
import { AuthPromptModal } from "../ui/AuthPromptModal";

type User = AuthUser;

interface AuthContextType {
  user: User | null;
  isAuthChecked: boolean;
  deleteAccount: (currentPassword: string) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  requestLogin: (onSuccess?: (user: User) => void) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const loginSuccessRef = useRef<((user: User) => void) | null>(null);

  useEffect(() => {
    checkAuthStatus()
      .then(({ isAuthenticated, user: userData }) => {
        setUser(isAuthenticated && userData ? userData : null);
      })
      .catch(() => setUser(null))
      .finally(() => setIsAuthChecked(true));
  }, []);

  useEffect(() => onAuthCleared(() => setUser(null)), [])

  async function login(credentials: LoginCredentials) {
    const nextUser = await loginApi(credentials);
    setUser(nextUser);
    return nextUser;
  }

  async function logout() {
    try {
      await logoutApi();
    } catch {
      // Logout should still clear local auth state when the server request fails.
    } finally {
      clearClientAuthState();
      setUser(null);
    }
  }

  async function deleteAccount(currentPassword: string) {
    await deleteAccountApi({ currentPassword });
    clearClientAuthState();
    setUser(null);
  }

  function requestLogin(onSuccess?: (user: User) => void) {
    if (user) {
      onSuccess?.(user);
      return;
    }

    loginSuccessRef.current = onSuccess ?? null;
    setIsLoginOpen(true);
  }

  function closeLoginModal() {
    loginSuccessRef.current = null;
    setIsLoginOpen(false);
  }

  async function handleModalLogin(credentials: LoginCredentials) {
    const nextUser = await login(credentials);
    const onSuccess = loginSuccessRef.current;

    loginSuccessRef.current = null;
    setIsLoginOpen(false);
    onSuccess?.(nextUser);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthChecked, deleteAccount, login, logout, requestLogin }}>
      {children}
      <AuthPromptModal
        description="Введіть email і пароль, щоб продовжити."
        isOpen={isLoginOpen}
        title="Увійдіть у профіль"
        onClose={closeLoginModal}
        onLogin={handleModalLogin}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
