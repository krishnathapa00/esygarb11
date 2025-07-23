
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Payment from "./pages/Payment";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageKYC from "./pages/admin/ManageKYC";
import ManageDarkstores from "./pages/admin/ManageDarkstores";
import DeliverySettings from "./pages/admin/DeliverySettings";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryProfile from "./pages/DeliveryProfile";
import DeliveryOrderDetail from "./pages/DeliveryOrderDetail";
import CartPage from "./pages/CartPage";
import Categories from "./pages/Categories";
import SubCategories from "./pages/SubCategories";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import OrderConfirmation from "./pages/OrderConfirmation";
import Checkout from "./pages/Checkout";
import { Unauthorized } from "./pages/Unauthorized";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<SubCategories />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
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
              path="/admin/orders"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <ManageOrders />
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
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/profile" element={<DeliveryProfile />} />
            <Route path="/delivery/order/:id" element={<DeliveryOrderDetail />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
