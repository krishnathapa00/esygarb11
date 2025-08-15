
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  UserCheck, 
  Settings,
  Store,
  CreditCard,
  LogOut,
  Grid3X3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = ({ children, onRefresh }: { children: React.ReactNode; onRefresh?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Grid3X3, label: 'Categories', path: '/admin/categories' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: UserCheck, label: 'KYC Management', path: '/admin/kyc' },
    { icon: UserCheck, label: 'Delivery Partners', path: '/admin/delivery-partners' },
    { icon: Store, label: 'Darkstores', path: '/admin/darkstores' },
    { icon: Settings, label: 'Delivery Settings', path: '/admin/delivery-settings' },
    { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-6 pb-20">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                  isActive ? 'bg-gray-100 border-r-2 border-green-500' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content with margin to account for fixed sidebar */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
