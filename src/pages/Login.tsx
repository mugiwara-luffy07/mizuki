import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function Login() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, error, user, role } = useAuthStore();
  
  // Get redirect message from state or sessionStorage
  const redirectMessage = (location.state as any)?.message || null;
  const redirectPath = sessionStorage.getItem('redirectAfterLogin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const loginAttempted = useRef(false);
  const roleCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clear errors when inputs change
  useEffect(() => {
    setLocalError(null);
  }, [email, password]);

  // FIXED: Watch for auth state changes after login and redirect
  useEffect(() => {
    if (loginAttempted.current && user) {
      console.log('[Login] Auth state updated after login - User:', user.id, 'Role:', role);
      
      // Check if this was an admin login attempt
      const wasAdminAttempt = sessionStorage.getItem('adminLoginAttempt') === 'true';
      console.log('[Login] Was admin attempt:', wasAdminAttempt, 'Current role:', role);
      
      // Redirect based on role OR admin attempt flag
      let redirectTo = tenant ? `/${tenant}` : '/';
      let shouldRedirect = false;
      
      // If admin login flag is set, wait for admin role or redirect after timeout
      if (wasAdminAttempt) {
        if (role === 'admin' || role === 'superadmin') {
          // Role has been loaded from database
          console.log('[Login] Admin role confirmed, redirecting to admin dashboard');
          redirectTo = tenant ? `/${tenant}/admin/dashboard` : '/superadmin/dashboard';
          shouldRedirect = true;
        } else if (role === 'user') {
          // Role is still 'user', wait a bit for it to update to admin
          console.log('[Login] Admin attempt flag set but role still "user", waiting for role update...');
          
          // Clear any existing timeout
          if (roleCheckTimeout.current) {
            clearTimeout(roleCheckTimeout.current);
          }
          
          // Wait up to 2 seconds for the admin role to be fetched from database
          roleCheckTimeout.current = setTimeout(() => {
            const currentRole = useAuthStore.getState().role;
            console.log('[Login] Timeout check - current role:', currentRole);
            
            // Even if role is still 'user', redirect to admin dashboard since admin attempt flag is set
            console.log('[Login] Admin attempt flag set, redirecting to admin dashboard despite role timing');
            loginAttempted.current = false;
            setSubmitting(false);
            sessionStorage.setItem('loginSuccessShown', 'true');
            sessionStorage.removeItem('redirectAfterLogin');
            sessionStorage.removeItem('adminLoginAttempt');
            navigate(tenant ? `/${tenant}/admin/dashboard` : '/superadmin/dashboard', { replace: true });
          }, 2000);
          
          return; // Don't redirect yet
        }
      } else {
        // Regular user login
        if (role) {
          if (role === 'admin' || role === 'superadmin') {
            redirectTo = tenant ? `/${tenant}/admin/dashboard` : '/superadmin/dashboard';
          }
          shouldRedirect = true;
        }
      }
      
      if (shouldRedirect) {
        // Clear timeout if it exists
        if (roleCheckTimeout.current) {
          clearTimeout(roleCheckTimeout.current);
        }
        
        console.log('[Login] Redirecting to:', redirectTo);
        loginAttempted.current = false;
        setSubmitting(false);
        sessionStorage.setItem('loginSuccessShown', 'true');
        sessionStorage.removeItem('redirectAfterLogin');
        sessionStorage.removeItem('adminLoginAttempt');
        navigate(redirectTo, { replace: true });
      }
    }
    
    return () => {
      if (roleCheckTimeout.current) {
        clearTimeout(roleCheckTimeout.current);
      }
    };
  }, [user, role, tenant, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Login] Form submitted');
    setLocalError(null);
    setSubmitting(true);
    loginAttempted.current = true;

    // Validation
    if (!email || !password) {
      console.log('[Login] Validation failed: missing email or password');
      setLocalError('Please fill in all fields');
      setSubmitting(false);
      loginAttempted.current = false;
      return;
    }

    if (!email.includes('@')) {
      console.log('[Login] Validation failed: invalid email');
      setLocalError('Please enter a valid email address');
      setSubmitting(false);
      loginAttempted.current = false;
      return;
    }

    try {
      console.log('[Login] Calling signIn with email:', email);
      await signIn(email, password);
      console.log('[Login] signIn succeeded - waiting for auth state update via useEffect');
      toast.success('Welcome back!');
      // useEffect will handle navigation when user/role are set
    } catch (err: any) {
      console.error('[Login] signIn failed with error:', err);
      const errorMessage = err?.message || 'Failed to sign in';
      console.log('[Login] Setting error message:', errorMessage);
      setLocalError(errorMessage);
      toast.error(errorMessage);
      setSubmitting(false);
      loginAttempted.current = false;
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-1">Sign In</h1>
            <p className="text-muted-foreground">Welcome back! Please sign in to your account</p>
            {redirectMessage && (
              <div className="mt-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm p-3 rounded-md">
                {redirectMessage}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-sm font-medium block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-styled pl-10"
                  placeholder="your@email.com"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm font-medium block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-styled pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={submitting}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                {displayError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mx-auto" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to={tenant ? `/${tenant}/signup` : '/signup'}
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

