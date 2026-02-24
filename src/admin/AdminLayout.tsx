import { useEffect } from 'react';
import { Outlet, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Store,
  Menu,
  X,
  Package,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { ThemeProvider } from '@/components/ThemeProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
  { icon: Package, label: 'Products', path: 'products' },
  { icon: Sparkles, label: 'Custom Products', path: 'custom-products' },
  { icon: ClipboardList, label: 'Orders', path: 'orders' },
  { icon: MessageSquare, label: 'Review Moderation', path: 'reviews' },
];

export default function AdminLayout() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, role } = useAuthStore();
  const { config, loadTenant, isLoading } = useTenantStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load tenant config if not loaded
  useEffect(() => {
    if (tenant) {
      loadTenant(tenant);
    }
  }, [tenant, loadTenant]);

  // Show loading state while config is loading
  if (isLoading || !config || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      // ignore errors for logout flow
    } finally {
      if (tenant) {
        navigate(`/${tenant}`, { replace: true });
      } else {
        navigate(`/`, { replace: true });
      }
    }
  };

  const currentPath = location.pathname.split('/').pop();

  return (
    <ThemeProvider>
      <div className="min-h-screen flex bg-muted/30">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Dark Theme */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-semibold text-white">{config.brandName}</h1>
                  <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-muted rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={`/${tenant}/admin/${item.path}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === item.path
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 space-y-2">
              <Link
                to={`/${tenant}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Store className="w-5 h-5" />
                View Store
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-md"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="lg:hidden" />
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">{config.brandName}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-tenant-primary text-tenant-secondary flex items-center justify-center font-semibold">
                  {config.brandName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
