import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Scissors, Menu, X, User } from 'lucide-react';
import { useTenantStore } from '@/store/tenantStore';

export function Navbar() {
  const { tenant } = useParams<{ tenant: string }>();
  const { config } = useTenantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!config || !tenant) return null;

  return (
    <nav className="nav-tenant sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to={`/${tenant}`} className="flex items-center gap-2">
            <img
              src="/logos/logo.jpeg"
              alt={`${config.brandName} logo`}
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="text-xl md:text-2xl font-semibold tracking-tight">
              {config.brandName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to={`/${tenant}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              to={`/${tenant}/order`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Custom Order
            </Link>
            <Link
              to={`/${tenant}/about`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to={`/${tenant}/admin`}
              className="p-2 hover:bg-muted rounded-full transition-colors hidden md:flex"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              to={`/${tenant}/order`}
              className="hidden md:flex items-center gap-2 btn-tenant text-sm"
            >
              <Scissors className="w-4 h-4" />
              Start Order
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-muted rounded-full transition-colors md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-down">
            <div className="flex flex-col gap-4">
              <Link
                to={`/${tenant}`}
                className="text-sm font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to={`/${tenant}/order`}
                className="text-sm font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Scissors className="w-4 h-4" /> Custom Order
              </Link>
              <Link
                to={`/${tenant}/about`}
                className="text-sm font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to={`/${tenant}/admin`}
                className="text-sm font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" /> Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
