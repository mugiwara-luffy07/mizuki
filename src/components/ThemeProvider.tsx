import { useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useTenantStore } from '@/store/tenantStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { tenant } = useParams<{ tenant: string }>();
  const { loadTenant } = useTenantStore();

  useEffect(() => {
    if (tenant) {
      loadTenant(tenant);
    }
  }, [tenant, loadTenant]);

  return <>{children}</>;
}

