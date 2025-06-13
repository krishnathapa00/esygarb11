
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Wallet, 
  LogOut, Menu, X
} from 'lucide-react';
import { useIsMobile } from '../../../hooks/use-mobile';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin-dashboard' },
    { name: 'Products', icon: Package, href: '/admin-products' },
    { name: 'Orders', icon: ShoppingBag, href: '/admin-orders' },
    { name: 'Users', icon: Users, href: '/admin-users' },
    { name: 'Transactions', icon: Wallet, href: '/admin-transactions' },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item, onClick }: { item: any; onClick?: () => void }) => (
    <Link
      to={item.href}
      onClick={onClick}
      className={`group flex items-center px-3 py-2 rounded-lg text-sm sm:text-base ${
        isActive(item.href)
          ? 'bg-green-100 text-green-700'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <item.icon className={`flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${
        isActive(item.href) ? 'text-green-700' : 'text-gray-400 group-hover:text-gray-600'
      }`} />
      <span className="font-medium">{item.name}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-sm">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center px-4">
            <h1 className="text-lg lg:text-xl font-bold text-green-600">EsyGrab Admin</h1>
          </div>
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
        <div className="px-4 py-4 border-t border-gray-200">
          <Link
            to="/admin-login"
            className="group flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
          >
            <LogOut className="flex-shrink-0 h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)}></div>
          
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white z-50">
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
                <h1 className="text-lg font-bold text-green-600">EsyGrab Admin</h1>
              </div>
              <nav className="mt-8 flex-1 px-4 space-y-1">
                {navigationItems.map((item) => (
                  <NavItem 
                    key={item.name} 
                    item={item} 
                    onClick={() => setIsSidebarOpen(false)}
                  />
                ))}
              </nav>
            </div>
            <div className="px-4 py-4 border-t border-gray-200">
              <Link
                to="/admin-login"
                className="group flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="flex-shrink-0 h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                <span className="font-medium">Logout</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 bg-white md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 border-b">
          <div className="flex items-center justify-between h-12 px-4">
            <button
              className="flex items-center justify-center h-10 w-10 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-green-600">EsyGrab Admin</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
        
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
