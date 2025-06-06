
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import SubCategories from "./pages/SubCategories";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import UserProfile from "./pages/UserProfile";
import OrderHistory from "./pages/OrderHistory";
import LoginSignup from "./pages/LoginSignup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import AssignDelivery from "./pages/admin/AssignDelivery";
import ManageUsers from "./pages/admin/ManageUsers";
import Transactions from "./pages/admin/Transactions";
import AdminLogin from "./pages/admin/AdminLogin";
import DeliveryList from "./pages/admin/DeliveryList";
import AssignOrder from "./pages/admin/AssignOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:categoryId" element={<SubCategories />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/login" element={<LoginSignup />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/assign-delivery" element={<AssignDelivery />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/transactions" element={<Transactions />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/delivery-list" element={<DeliveryList />} />
          <Route path="/admin/assign-order/:orderId" element={<AssignOrder />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
