
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AllCategories from "./pages/Categories";
import CategoryProducts from "./pages/SubCategories";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import AuthHybrid from "./pages/AuthHybrid";
import DeliveryPartnerAuth from "./pages/DeliveryPartnerAuth";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import Transactions from "./pages/admin/Transactions";
import NotFound from "./pages/NotFound";
import MapLocation from "./pages/MapLocation";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Customer & Admin Hybrid Auth Routes */}
              <Route path="/auth" element={<AuthHybrid />} />
              {/* Remove the /login route mapping to LoginSignup, now uses AuthHybrid */}
              <Route path="/login" element={<AuthHybrid />} />
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<AllCategories />} />
              <Route path="/categories/:categoryId" element={<CategoryProducts />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/shopping-cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/track-order/:id" element={<OrderTracking />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/my-profile" element={<UserProfile />} />
              <Route path="/location" element={<MapLocation />} />
              <Route path="/delivery-location" element={<MapLocation />} />
              <Route path="/map-location" element={<MapLocation />} />
              
              {/* Delivery Partner Routes */}
              <Route path="/delivery-partner" element={<DeliveryPartnerAuth />} />
              <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin-products" element={<ManageProducts />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
              <Route path="/admin-orders" element={<ManageOrders />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin-users" element={<ManageUsers />} />
              <Route path="/admin/transactions" element={<Transactions />} />
              <Route path="/admin-transactions" element={<Transactions />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

