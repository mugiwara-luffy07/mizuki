import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Main landing (redirects to default tenant)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Tenant pages
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import About from "./pages/About";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import CustomOrderList from "./pages/CustomOrderList";
import CustomOrderDetails from "./pages/CustomOrderDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductCheckout from "./pages/ProductCheckout";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProductOrderSuccess from "./pages/ProductOrderSuccess";
import MyOrders from "./pages/MyOrders";
import MyOrderDetails from "./pages/MyOrderDetails";
import ProductOrderDetails from "./pages/ProductOrderDetails";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import DisclaimerPolicy from "./pages/DisclaimerPolicy";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import SupabaseDiagnostics from "./pages/SupabaseDiagnostics";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Admin
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import DashboardHome from "./admin/DashboardHome";
import AdminProducts from "./admin/AdminProducts";
import AdminCustomProducts from "./admin/AdminCustomProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminEcommerceOrders from "./admin/AdminEcommerceOrders";
import AdminReviews from "./admin/AdminReviews";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

// Super Admin
import SuperAdminLogin from "./superadmin/SuperAdminLogin";
import SuperAdminLayout from "./superadmin/SuperAdminLayout";
import SuperAdminDashboard from "./superadmin/DashboardHome";
import TenantsList from "./superadmin/TenantsList";
import CreateTenant from "./superadmin/CreateTenant";
import { ProtectedRouteSuperadmin } from "./superadmin/ProtectedRouteSuperadmin";

const queryClient = new QueryClient();

// Component to initialize auth session
function AuthInitializer() {
  const { checkSession } = useAuthStore();
  
  useEffect(() => {
    checkSession();
  }, [checkSession]);
  
  return null;
}

function LegacyOrderRedirect() {
  const { tenant } = useParams<{ tenant: string }>();

  if (!tenant) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={`/${tenant}/custom-order`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer />
        <Routes>
          {/* Root redirects to default tenant */}
          <Route path="/" element={<Index />} />

          {/* Super Admin Routes (hidden, no public links) */}
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route element={<ProtectedRouteSuperadmin />}>
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="tenants" element={<TenantsList />} />
              <Route path="create-tenant" element={<CreateTenant />} />
            </Route>
          </Route>

          {/* Tenant Admin Routes */}
          <Route path="/:tenant/admin" element={<AdminLogin />} />
          <Route element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route path="/:tenant/admin/dashboard" element={<DashboardHome />} />
            <Route path="/:tenant/admin/products" element={<AdminProducts />} />
            <Route path="/:tenant/admin/custom-products" element={<AdminCustomProducts />} />
            <Route path="/:tenant/admin/orders" element={<AdminEcommerceOrders />} />
            <Route path="/:tenant/admin/custom-orders" element={<AdminOrders />} />
            <Route path="/:tenant/admin/reviews" element={<AdminReviews />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/diagnostics" element={<SupabaseDiagnostics />} />
          <Route path="/:tenant/order" element={<LegacyOrderRedirect />} />
          <Route path="/:tenant/login" element={<Login />} />
          <Route path="/:tenant/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Tenant Customer Routes (main public-facing) */}
          <Route path="/:tenant" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:slug" element={<ProductDetails />} />
            <Route path="custom-order" element={<CustomOrderList />} />
            <Route path="custom-order/:slug" element={<CustomOrderDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route 
              path="checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="product-checkout" 
              element={
                <ProtectedRoute>
                  <ProductCheckout />
                </ProtectedRoute>
              } 
            />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="product-order-success" element={<ProductOrderSuccess />} />
            <Route 
              path="my-orders" 
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-orders/:orderId" 
              element={
                <ProtectedRoute>
                  <ProductOrderDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-orders/:id" 
              element={
                <ProtectedRoute>
                  <MyOrderDetails />
                </ProtectedRoute>
              } 
            />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route path="orders/:orderId" element={<OrderTracking />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-conditions" element={<TermsConditions />} />
            <Route path="refund-policy" element={<RefundPolicy />} />
            <Route path="disclaimer-policy" element={<DisclaimerPolicy />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
