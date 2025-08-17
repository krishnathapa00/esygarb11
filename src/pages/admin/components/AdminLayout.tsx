import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  CreditCard, 
  Tag,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-40 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        <nav className="mt-6 pb-20">
          <div className="px-4 space-y-2">
            <NavLink to="/admin/dashboard" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </NavLink>
            
            <NavLink to="/admin/orders" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <ShoppingCart className="h-5 w-5 mr-3" />
              Orders
            </NavLink>
            
            <NavLink to="/admin/products" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <Package className="h-5 w-5 mr-3" />
              Products
            </NavLink>
            
            <NavLink to="/admin/categories" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <Tag className="h-5 w-5 mr-3" />
              Categories
            </NavLink>
            
            <NavLink to="/admin/users" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <Users className="h-5 w-5 mr-3" />
              Users
            </NavLink>
            
            <NavLink to="/admin/delivery-partners" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <Truck className="h-5 w-5 mr-3" />
              Delivery Partners
            </NavLink>
            
            <NavLink to="/admin/transactions" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <CreditCard className="h-5 w-5 mr-3" />
              Transactions
            </NavLink>

            <NavLink to="/admin/kyc" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <Users className="h-5 w-5 mr-3" />
              KYC Verification
            </NavLink>

            <NavLink to="/admin/delivery-settings" className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              <Truck className="h-5 w-5 mr-3" />
              Delivery Settings
            </NavLink>
            
            <button 
              onClick={() => {
                signOut();
                navigate('/admin/login');
              }}
              className="flex items-center px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-red-600 hover:text-white w-full mt-4"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content with margin to account for fixed sidebar */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto bg-gray-50">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;