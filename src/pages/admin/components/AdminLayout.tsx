
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Wallet, 
  LogOut, Menu, X
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Transactions', icon: Wallet, href: '/admin/transactions' },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-sm">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center px-4">
            <h1 className="text-xl font-bold text-green-600">EsyGrab Admin</h1>
          </div>
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 rounded-lg ${
                  isActive(item.href)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`flex-shrink-0 h-5 w-5 mr-3 ${
                  isActive(item.href) ? 'text-green-700' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-4 py-4 border-t border-gray-200">
          <Link
            to="/admin"
            className="group flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="flex-shrink-0 h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)}></div>
        
        <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center px-4">
              <h1 className="text-xl font-bold text-green-600">EsyGrab Admin</h1>
            </div>
            <nav className="mt-8 flex-1 px-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 rounded-lg ${
                    isActive(item.href)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`flex-shrink-0 h-5 w-5 mr-3 ${
                    isActive(item.href) ? 'text-green-700' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="px-4 py-4 border-t border-gray-200">
            <Link
              to="/admin"
              className="group flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="flex-shrink-0 h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span className="font-medium">Logout</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="flex items-center justify-center h-12 w-12 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
