import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Scissors, Menu, X, User, LogOut, ShoppingBag, Heart, MessageCircle, LayoutDashboard } from 'lucide-react';
import { useTenantStore } from '@/store/tenantStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export function Navbar() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const { config } = useTenantStore();
  const { user, username, role, signOut } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cartItemCount = getItemCount();
  const wishlistCount = wishlistItems.length;
  const isAdmin = role === 'admin' || role === 'superadmin';

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to tenant home after logout
      if (tenant) {
        navigate(`/${tenant}`, { replace: true });
      } else {
        navigate(`/`, { replace: true });
      }
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!config || !tenant) {
    return (
      <nav className="nav-tenant sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </nav>
    );
  }

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
              to={`/${tenant}/about`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              to={`/${tenant}/shop`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Shop
            </Link>
            <Link
              to={`/${tenant}/custom-order`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Custom Order
            </Link>
            <Link
              to={`/${tenant}/contact`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
          

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link
              to={`/${tenant}/cart`}
              className="relative p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Wishlist Icon */}
            <Link
              to={`/${tenant}/wishlist`}
              className="relative p-2 hover:bg-muted rounded-full transition-colors hidden md:flex"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  to={`/${tenant}/my-orders`}
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    to={`/${tenant}/admin/dashboard`}
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={tenant ? `/${tenant}/login` : '/login'}
                  className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  to={tenant ? `/${tenant}/signup` : '/signup'}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
            <Link 
              to={`/${tenant}/admin`}
              className="p-2 hover:bg-muted rounded-full transition-colors hidden md:flex"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              to={`/${tenant}/custom-order`}
              className="hidden md:flex items-center gap-2 btn-tenant text-sm"
            >
              <Scissors className="w-4 h-4" />
              Start Order
            </Link>
            <a
              href="https://wa.me/919942322743"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 btn-tenant text-sm bg-emerald-500 text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48C18.25 1.23 15.16 0 11.99 0 5.43 0 .16 5.25.16 11.81c0 2.16.56 4.27 1.64 6.16L0 24l6.39-1.67c1.8.98 3.83 1.5 5.92 1.5 6.56 0 11.83-5.25 11.83-11.81 0-3.16-1.23-6.13-3.47-8.36zM11.99 21.81c-1.85 0-3.65-.5-5.23-1.45l-.375-.22-3.88 1.01 1.03-3.76-.24-.38C2.77 15.88 2.16 14 2.16 11.99 2.16 6.32 6.7 1.87 12.35 1.87c2.83 0 5.49 1.1 7.5 3.1 2 2 3.1 4.67 3.1 7.5 0 5.65-4.45 10.24-10.1 10.24zm5.52-7.68c-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.36.22-.66.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.38-.025-.53-.075-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51-.18-.01-.38-.01-.58-.01-.2 0-.52.075-.8.375-.28.3-1.06 1.03-1.06 2.51 0 1.48 1.09 2.91 1.24 3.11.15.2 2.13 3.25 5.16 4.56.72.3 1.28.48 1.72.63.73.23 1.4.2 1.91.12.58-.08 1.79-.73 2.04-1.43.25-.7.25-1.31.175-1.43-.075-.12-.275-.2-.575-.35z"/></svg>
              WhatsApp
            </a>
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
                to={`/${tenant}/about`}
                className="text-sm font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to={`/${tenant}/shop`}
                className="text-sm font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to={`/${tenant}/custom-order`}
                className="text-sm font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Scissors className="w-4 h-4" /> Custom Order
              </Link>
              <Link
                to={`/${tenant}/contact`}
                className="text-sm font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to={`/${tenant}/cart`}
                className="text-sm font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBag className="w-4 h-4" /> Cart
                {cartItemCount > 0 && (
                  <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              {user ? (
                <>
                  <Link
                    to={`/${tenant}/my-orders`}
                    className="text-sm font-medium py-2 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to={`/${tenant}/admin/dashboard`}
                      className="text-sm font-medium py-2 flex items-center gap-2 text-primary bg-primary/10 px-3 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium py-2 flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={tenant ? `/${tenant}/login` : '/login'}
                    className="text-sm font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to={tenant ? `/${tenant}/signup` : '/signup'}
                    className="text-sm font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <Link
                to={`/${tenant}/admin`}
                className="text-sm font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" /> Admin
              </Link>
              <a
                href="https://wa.me/919942322743"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium py-2 flex items-center gap-2 btn-tenant justify-center bg-emerald-500 text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48C18.25 1.23 15.16 0 11.99 0 5.43 0 .16 5.25.16 11.81c0 2.16.56 4.27 1.64 6.16L0 24l6.39-1.67c1.8.98 3.83 1.5 5.92 1.5 6.56 0 11.83-5.25 11.83-11.81 0-3.16-1.23-6.13-3.47-8.36zM11.99 21.81c-1.85 0-3.65-.5-5.23-1.45l-.375-.22-3.88 1.01 1.03-3.76-.24-.38C2.77 15.88 2.16 14 2.16 11.99 2.16 6.32 6.7 1.87 12.35 1.87c2.83 0 5.49 1.1 7.5 3.1 2 2 3.1 4.67 3.1 7.5 0 5.65-4.45 10.24-10.1 10.24zm5.52-7.68c-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.36.22-.66.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.38-.025-.53-.075-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51-.18-.01-.38-.01-.58-.01-.2 0-.52.075-.8.375-.28.3-1.06 1.03-1.06 2.51 0 1.48 1.09 2.91 1.24 3.11.15.2 2.13 3.25 5.16 4.56.72.3 1.28.48 1.72.63.73.23 1.4.2 1.91.12.58-.08 1.79-.73 2.04-1.43.25-.7.25-1.31.175-1.43-.075-.12-.275-.2-.575-.35z" /></svg> WhatsApp Chat
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
