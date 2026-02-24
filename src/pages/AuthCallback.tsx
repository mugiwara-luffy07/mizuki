import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/supabase-client';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Auth Callback Page
 * 
 * Handles email verification callback from Supabase.
 * After verification, redirects to home page with welcome message.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSession } = useAuthStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from URL (Supabase puts tokens here)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Also check query params (some flows use query params)
        const queryType = searchParams.get('type');
        const queryToken = searchParams.get('token');

        // Handle email verification
        if (type === 'signup' || queryType === 'signup' || accessToken) {
          // Exchange the session
          if (accessToken && refreshToken) {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              throw sessionError;
            }

            if (data.session) {
              // Refresh auth state
              await checkSession();
              
              setStatus('success');
              toast.success('Email verified successfully!');
              
              // Get username from user metadata or profile
              const username = data.user?.user_metadata?.username || 
                             data.user?.email?.split('@')[0] || 
                             'User';

              // Wait a moment to show success, then redirect
              setTimeout(() => {
                // Try to get tenant from query params, URL, or use default
                const tenantParam = searchParams.get('tenant');
                const currentPath = window.location.pathname;
                const tenantMatch = currentPath.match(/\/([^\/]+)\//);
                const tenant = tenantParam || (tenantMatch ? tenantMatch[1] : 'mizuki');
                
                navigate(`/${tenant}`, { 
                  replace: true,
                  state: { 
                    verified: true,
                    message: `Welcome, ${username}! Your email has been verified.`
                  }
                });
              }, 2000);
              return;
            }
          }

          // Alternative: Use verifyOtp if token is in query params
          if (queryToken) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: queryToken,
              type: 'signup',
            });

            if (verifyError) {
              throw verifyError;
            }

            await checkSession();
            setStatus('success');
            toast.success('Email verified successfully!');
            
            setTimeout(() => {
              const tenantParam = searchParams.get('tenant');
              const currentPath = window.location.pathname;
              const tenantMatch = currentPath.match(/\/([^\/]+)\//);
              const tenant = tenantParam || (tenantMatch ? tenantMatch[1] : 'mizuki');
              
              navigate(`/${tenant}`, { 
                replace: true,
                state: { verified: true }
              });
            }, 2000);
            return;
          }
        }

        // If no tokens found, check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await checkSession();
          setStatus('success');
          
          setTimeout(() => {
            const tenantParam = searchParams.get('tenant');
            const currentPath = window.location.pathname;
            const tenantMatch = currentPath.match(/\/([^\/]+)\//);
            const tenant = tenantParam || (tenantMatch ? tenantMatch[1] : 'mizuki');
            
            navigate(`/${tenant}`, { replace: true });
          }, 1500);
          return;
        }

        // No valid session found
        throw new Error('Invalid verification link');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Failed to verify email');
        setStatus('error');
        toast.error(err.message || 'Failed to verify email');
        
        // Redirect to login after error
        setTimeout(() => {
          const tenantParam = searchParams.get('tenant');
          const currentPath = window.location.pathname;
          const tenantMatch = currentPath.match(/\/([^\/]+)\//);
          const tenant = tenantParam || (tenantMatch ? tenantMatch[1] : 'mizuki');
          
          navigate(`/${tenant}/login`, { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, checkSession]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <h2 className="text-xl font-semibold mb-2">Verifying Email</h2>
              <p className="text-muted-foreground">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground mb-4">
                Your email has been successfully verified. Redirecting to home page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-destructive">Verification Failed</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

