import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';

export default function AdminLogin() {
  const { tenant } = useParams<{ tenant: string }>();

  // Redirect to regular login page
  // The admin status will be checked after login via ProtectedAdminRoute
  useEffect(() => {
    // Save a flag in sessionStorage to indicate this is an admin login attempt
    sessionStorage.setItem('adminLoginAttempt', 'true');
  }, []);

  return <Navigate to={tenant ? `/${tenant}/login` : '/login'} replace />;
}
