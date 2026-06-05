import type { ReactNode } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { requestLogin, user } = useAuth();

  if (!user) {
    return (
      <div className="auth-guard">
        <p>Ця форма доступна лише для авторизованих користувачів.</p>
        <button
          className="auth-guard__btn"
          type="button"
          onClick={() => requestLogin()}
        >
          Увійти
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
