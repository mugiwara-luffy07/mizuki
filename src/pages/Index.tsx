import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_TENANT } from '@/config/defaultTenant';
import { Loader2 } from 'lucide-react';

// Root page redirects to default tenant
export default function Index() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Small delay to ensure React Router is ready
      const timer = setTimeout(() => {
        navigate(`/${DEFAULT_TENANT}`, { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    } catch (err: any) {
      console.error('Navigation error:', err);
      setError(err?.message || 'Failed to redirect');
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4 text-destructive">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <a 
            href={`/${DEFAULT_TENANT}`}
            className="text-primary hover:underline"
          >
            Click here to go to {DEFAULT_TENANT}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
