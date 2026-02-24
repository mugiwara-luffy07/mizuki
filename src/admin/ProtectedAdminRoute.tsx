import { useEffect, useState } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { tenant } = useParams<{ tenant: string }>();
  const location = useLocation();
  const { user, role, isAdmin, checkSession } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldDenyAccess, setShouldDenyAccess] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // Initial check
      await checkSession();
      setIsChecking(false);
      
      // If role is still 'user' after initial check, wait a bit more for profile to load
      if (useAuthStore.getState().role === 'user') {
        console.log('[ProtectedAdminRoute] Role is still "user", waiting for profile fetch...');
        
        // Wait up to 4 seconds for the role to update
        const startTime = Date.now();
        const checkRoleInterval = setInterval(() => {
          const currentRole = useAuthStore.getState().role;
          console.log('[ProtectedAdminRoute] Checking role:', currentRole);
          
          if (currentRole === 'admin' || currentRole === 'superadmin') {
            console.log('[ProtectedAdminRoute] Role updated to admin!');
            clearInterval(checkRoleInterval);
          } else if (Date.now() - startTime > 4000) {
            // Timeout - role is not admin and we've waited long enough
            console.log('[ProtectedAdminRoute] Timeout - role is not admin after 4 seconds');
            clearInterval(checkRoleInterval);
            setShouldDenyAccess(true);
          }
        }, 200);
        
        return () => clearInterval(checkRoleInterval);
      }
    };

    verifyAuth();
  }, [checkSession]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    console.log('[ProtectedAdminRoute] No user, redirecting to login');
    // Save the current path to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to={tenant ? `/${tenant}/login` : '/login'} state={{ message: 'Please login to continue' }} replace />;
  }

  // Logged in but not an admin - redirect to home with error
  if (shouldDenyAccess || (!isAdmin() && role === 'user')) {
    console.log('[ProtectedAdminRoute] Access denied - User is not admin. Role:', role);
    return (
      <Navigate 
        to={tenant ? `/${tenant}` : '/'} 
        state={{ message: 'Access denied. Admin privileges required.' }} 
        replace 
      />
    );
  }

  // User is authenticated and is an admin
  console.log('[ProtectedAdminRoute] Access granted - User is admin. Role:', role);
  return <>{children}</>;
}
