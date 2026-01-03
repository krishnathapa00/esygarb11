import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthProvider";
import { CartProvider } from "@/contexts/CartContext";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { RoleProtectedRoute } from "@/components/shared";

// Public/Shared Pages
import Index from "./pages/Index";
import AllCategories from "./pages/Categories";
import CategoryProducts from "./pages/SubCategories";
import AuthHybrid from "./pages/AuthHybrid";
import MapLocationEnhanced from "./pages/MapLocationEnhanced";
import Waitlist from "./pages/Waitlist";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import SubCategoriesPage from "./pages/SubCategoriesPage";
import AboutUs from "./pages/AboutUs";
import HowItWorks from "./pages/HowItWorks";
import Careers from "./pages/Careers";
import ContactUs from "./pages/ContactUs";
import SupportPage from "./pages/SupportPage";
import HelpCenter from "./pages/HelpCenter";
import ReturnsRefunds from "./pages/ReturnsRefunds";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// User/Customer Pages
import {
  CartPage,
  Checkout,
  OrderConfirmation,
  OrderHistory,
  OrderTrackingLookup,
  OrderTrackingWithMap,
  ProductDetails,
  SearchResults,
  UserProfile,
  ReferralPage,
  ReferralLandingPage,
} from "./pages/user";

// Delivery Partner Pages
import {
  DeliveryDashboard,
  DeliveryEarnings,
  DeliveryHistory,
  DeliveryMapNavigationNew,
  DeliveryOrderDetail,
  DeliveryOrders,
  DeliveryPartnerAuth,
  DeliveryProfile,
  DeliveryWithdraw,
} from "./pages/delivery";

// Admin Pages
import {
  AdminLogin,
  AdminDashboard,
  ManageProducts,
  ManageOrders,
  ManageUsers,
  Transactions,
  AssignOrder,
  AddProduct,
  ManageKYC,
  DeliveryPartnerManagement,
  ManageDarkstores,
  DeliverySettings,
  ManageCategories,
  AddProductNew,
  OrderDetails,
  ManagePromoCodes,
} from "./pages/admin";

import { useRequireCompleteProfile } from "./hooks/useRequireCompleteProfile";
import AdminOutOfStock from "./pages/admin/AdminOutOfStock";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache queries for 5 minutes by default to reduce database calls
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes to reduce egress
      gcTime: 10 * 60 * 1000,
      // Disable automatic refetches - rely on manual invalidation and realtime subscriptions
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      // Retry failed queries only once to avoid hammering the database
      retry: 1,
      // Enable request deduplication
      networkMode: "online",
    },
    mutations: {
      // Retry mutations only once
      retry: 1,
      networkMode: "online",
    },
  },
});

const AppContent = () => {
  useActivityTracker();
  useSessionPersistence();
  useRequireCompleteProfile();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthHybrid />} />
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<AllCategories />} />
          <Route
            path="/category/:categoryName/products"
            element={<CategoryProducts />}
          />
          <Route path="/categories/:slug" element={<CategoryProducts />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/subcategories/:slug" element={<SubCategoriesPage />} />
          <Route
            path="/order-tracking/:orderId"
            element={<OrderTrackingWithMap />}
          />
          <Route
            path="/order-tracking-lookup"
            element={<OrderTrackingLookup />}
          />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/map-location" element={<MapLocationEnhanced />} />
          {/* <Route path="/map-location" element={<MapLocationTest />} /> */}
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/returns-refunds" element={<ReturnsRefunds />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route
            path="/category/:categoryName"
            element={<CategoryProducts />}
          />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="/ref/:code" element={<ReferralLandingPage />} />;
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
                <DeliveryMapNavigationNew />
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
            path="/admin/out-of-stock"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <AdminOutOfStock />
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
            path="/admin/add-product-new"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <AddProductNew />
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
          <Route
            path="/admin/promo-codes"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <ManagePromoCodes />
              </RoleProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
            <Toaster />
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
