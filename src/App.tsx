
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthHybrid from "./pages/AuthHybrid";
import Home from "./pages/Index";
import Payment from "./pages/PaymentPage";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/UserProfile";
import CartPage from "./pages/CartPage";
import Categories from "./pages/Categories";
import SubCategories from "./pages/SubCategories";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import AddProduct from "./pages/admin/AddProduct";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageKYC from "./pages/admin/ManageKYC";
import ManageDarkstores from "./pages/admin/ManageDarkstores";
import DeliverySettings from "./pages/admin/DeliverySettings";
import OrderDetails from "./pages/admin/OrderDetails";
import Transactions from "./pages/admin/Transactions";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryProfile from "./pages/DeliveryProfile";
import DeliveryOrderDetail from "./pages/DeliveryOrderDetail";
import DeliveryPartnerAuth from "./pages/DeliveryPartnerAuth";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<AuthHybrid />} />
          <Route path="/login" element={<AuthHybrid />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<SubCategories />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
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
            path="/admin/add-product"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <AddProduct />
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
            path="/admin/orders/:id"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <OrderDetails />
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
            path="/admin/kyc"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <ManageKYC />
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
            path="/admin/transactions"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <Transactions />
              </RoleProtectedRoute>
            }
          />
          
          {/* Delivery Partner Routes */}
          <Route path="/delivery/auth" element={<DeliveryPartnerAuth />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/profile" element={<DeliveryProfile />} />
          <Route path="/delivery/order/:id" element={<DeliveryOrderDetail />} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
