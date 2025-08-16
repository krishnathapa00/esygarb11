import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthProvider";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/components/Toast";
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import Index from "./pages/Index";
import AllCategories from "./pages/Categories";
import CategoryProducts from "./pages/SubCategories";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import OrderTrackingLookup from "./pages/OrderTrackingLookup";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import AuthHybrid from "./pages/AuthHybrid";
import DeliveryPartnerAuth from "./pages/DeliveryPartnerAuth";
import AdminLogin from "./pages/admin/AdminLogin";
import DeliveryDashboard from "./pages/DeliveryDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import Transactions from "./pages/admin/Transactions";
import AssignOrder from "./pages/admin/AssignOrder";
import AddProduct from "./pages/admin/AddProduct";
import ManageKYC from "./pages/admin/ManageKYC";
import DeliveryPartnerManagement from "./pages/admin/DeliveryPartnerManagement";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import MapLocation from "./pages/MapLocation";
import SearchResults from "./pages/SearchResults";
import Waitlist from './pages/Waitlist';
import DeliveryProfile from './pages/DeliveryProfile';
import DeliveryOrders from './pages/DeliveryOrders';
import DeliveryOrderDetail from './pages/DeliveryOrderDetail';
import DeliveryEarnings from './pages/DeliveryEarnings';
import DeliveryHistory from './pages/DeliveryHistory';
import DeliveryWithdraw from './pages/DeliveryWithdraw';
import DeliveryMapNavigation from './pages/DeliveryMapNavigation';
import ManageDarkstores from './pages/admin/ManageDarkstores';
import DeliverySettings from './pages/admin/DeliverySettings';
import ManageCategories from './pages/admin/ManageCategories';
import AddProductNew from './pages/admin/AddProductNew';
import OrderDetails from './pages/admin/OrderDetails';

const queryClient = new QueryClient();

// Component to handle activity tracking and session persistence
const AppContent = () => {
  useActivityTracker();
  useSessionPersistence();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthHybrid />} />
        <Route path="/" element={<Index />} />
        <Route path="/categories" element={<AllCategories />} />
        <Route path="/categories/:categoryId" element={<CategoryProducts />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="/order-tracking-lookup" element={<OrderTrackingLookup />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/map-location" element={<MapLocation />} />
        <Route path="/waitlist" element={<Waitlist />} />

        {/* Delivery Partner Routes */}
        <Route path="/delivery-partner" element={<DeliveryPartnerAuth />} />
        <Route
          path="/delivery-partner/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/delivery-partner/profile"
          element={
            <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryProfile />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/delivery-partner/orders"
          element={
            <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryOrders />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/delivery-partner/order/:orderId"
          element={
            <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryOrderDetail />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/delivery-partner/earnings"
          element={
            <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryEarnings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/delivery-partner/history"
          element={
            <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryHistory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/delivery-partner/withdraw"
          element={
            <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryWithdraw />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/delivery-partner/navigate/:orderId"
          element={
            <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryMapNavigation />
            </RoleProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <ManageProducts />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <ManageOrders />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/:orderId"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <OrderDetails />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/assign/:orderId"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AssignOrder />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <ManageUsers />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <Transactions />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/products/add"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AddProduct />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <ManageKYC />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/delivery-partners"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <DeliveryPartnerManagement />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/darkstores"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <ManageDarkstores />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/delivery-settings"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <DeliverySettings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <ManageCategories />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/products/add-new"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AddProductNew />
            </RoleProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;