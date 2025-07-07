import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
<<<<<<< HEAD
import { CartProvider } from "@/contexts/CartContext";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
=======
>>>>>>> 398f62f (code pushed by undead)
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
<<<<<<< HEAD
import AssignOrder from "./pages/admin/AssignOrder";
=======
>>>>>>> 398f62f (code pushed by undead)
import NotFound from "./pages/NotFound";
import MapLocation from "./pages/MapLocation";
import SearchResults from "./pages/SearchResults";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
<<<<<<< HEAD
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Customer & Admin Hybrid Auth Routes */}
                <Route path="/auth" element={<AuthHybrid />} />
                <Route path="/login" element={<AuthHybrid />} />
                <Route path="/" element={<Index />} />
                <Route path="/categories" element={<AllCategories />} />
                <Route
                  path="/categories/:categoryId"
                  element={<CategoryProducts />}
                />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route
                  path="/order-confirmation"
                  element={<OrderConfirmation />}
                />
                <Route path="/track-order/:id" element={<OrderTracking />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/location" element={<MapLocation />} />

                {/* Delivery Partner Routes */}
                <Route
                  path="/delivery-partner"
                  element={<DeliveryPartnerAuth />}
                />
                <Route
                  path="/delivery-dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={['delivery_partner']}>
                      <DeliveryDashboard />
                    </RoleProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/products" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <ManageProducts />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/orders" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <ManageOrders />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/orders/assign/:orderId" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <AssignOrder />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/transactions" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <Transactions />
                    </RoleProtectedRoute>
                  } 
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </CartProvider>
=======
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Customer & Admin Hybrid Auth Routes */}
              <Route path="/auth" element={<AuthHybrid />} />
              {/* Remove the /login route mapping to LoginSignup, now uses AuthHybrid */}
              <Route path="/login" element={<AuthHybrid />} />
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<AllCategories />} />
              <Route
                path="/categories/:categoryId"
                element={<CategoryProducts />}
              />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmation />}
              />
              <Route path="/track-order/:id" element={<OrderTracking />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/location" element={<MapLocation />} />

              {/* Delivery Partner Routes */}
              <Route
                path="/delivery-partner"
                element={<DeliveryPartnerAuth />}
              />
              <Route
                path="/delivery-dashboard"
                element={<DeliveryDashboard />}
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/transactions" element={<Transactions />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
>>>>>>> 398f62f (code pushed by undead)
      </AuthProvider>
    </QueryClientProvider>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 398f62f (code pushed by undead)
