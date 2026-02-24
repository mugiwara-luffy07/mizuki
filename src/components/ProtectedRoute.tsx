import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 * 
 * Protects routes that require authentication.
 * - Redirects to login if user is not authenticated
 * - Shows message about needing to login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { tenant } = useParams<{ tenant: string }>();
  const { user, isLoading, initialized } = useAuthStore();

  // Show loading only if auth hasn't been initialized yet
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Store the attempted route for redirect after login
    const currentPath = window.location.pathname;
    if (currentPath) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    return (
      <Navigate 
        to={tenant ? `/${tenant}/login` : '/login'} 
        replace 
        state={{ message: 'Please login to place an order' }}
      />
    );
  }

  return <>{children}</>;
}

