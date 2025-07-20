import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import Index from "./pages/Index";
import AllCategories from "./pages/Categories";
import CategoryProducts from "./pages/SubCategories";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import PaymentPage from "./pages/PaymentPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import LocationSelector from "./pages/LocationSelector";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryProfile from "./pages/DeliveryProfile";
import AuthHybrid from "./pages/AuthHybrid";
import AuthPasswordReset from "./pages/AuthPasswordReset";
import DeliveryPartnerAuth from "./pages/DeliveryPartnerAuth";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import OrderDetails from "./pages/admin/OrderDetails";
import AddProduct from "./pages/admin/AddProduct";
import ManageUsers from "./pages/admin/ManageUsers";
import Transactions from "./pages/admin/Transactions";
import AssignOrder from "./pages/admin/AssignOrder";
import AssignDelivery from "./pages/admin/AssignDelivery";
import DeliveryList from "./pages/admin/DeliveryList";
import NotFound from "./pages/NotFound";
import MapLocation from "./pages/MapLocation";
import SearchResults from "./pages/SearchResults";
import SupportPage from "./pages/SupportPage";
import { Unauthorized } from "./pages/Unauthorized";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/auth" element={<AuthHybrid />} />
              <Route path="/auth/reset" element={<AuthPasswordReset />} />
              <Route path="/login" element={<AuthHybrid />} />
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<AllCategories />} />
              <Route path="/categories/:categoryId" element={<CategoryProducts />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/track-order/:id" element={<OrderTracking />} />
              <Route path="/location-selector" element={<LocationSelector />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/location" element={<MapLocation />} />

              {/* Delivery Partner Routes */}
              <Route
                path="/delivery-partner"
                element={<DeliveryPartnerAuth />}
              />
              <Route
                path="/delivery-auth"
                element={<DeliveryPartnerAuth />}
              />
              <Route
                path="/delivery-dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
                    <DeliveryDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/delivery-profile"
                element={
                  <RoleProtectedRoute allowedRoles={["delivery_partner"]}>
                    <DeliveryProfile />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/order-history"
                element={
                  <RoleProtectedRoute allowedRoles={["delivery_partner", "customer"]}>
                    <OrderHistory />
                  </RoleProtectedRoute>
                }
              />
              <Route path="/support" element={<SupportPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
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
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <OrderDetails />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/products/add"
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <AddProduct />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/orders/assign/:orderId"
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <AssignOrder />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <ManageUsers />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions"
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Transactions />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/delivery-partners"
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <DeliveryList />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/assign-delivery"
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <AssignDelivery />
                  </RoleProtectedRoute>
                }
              />

              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
