
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SignUp from "./pages/AuthHybrid";
import Login from "./pages/AuthHybrid";
import Home from "./pages/Index";
import Payment from "./pages/PaymentPage";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/UserProfile";
import CartPage from "./pages/CartPage";
import Categories from "./pages/Categories";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import AddProduct from "./pages/admin/AddProduct";
import ManageOrders from "./pages/admin/ManageOrders";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageKYC from "./pages/admin/ManageKYC";
import ManageDarkstores from "./pages/admin/ManageDarkstores";
import DeliverySettings from "./pages/admin/DeliverySettings";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryProfile from "./pages/DeliveryProfile";
import DeliveryOrderDetail from "./pages/DeliveryOrderDetail";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
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
    </AuthProvider>
  );
};

export default App;
