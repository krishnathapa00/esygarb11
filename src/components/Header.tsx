
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Clock, User, Home, Grid3X3, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  cartItems: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({
  cartItems,
  onCartClick,
  searchQuery,
  onSearchChange
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const MobileNavButton = ({ to, icon: Icon, label, isActive }: { to: string; icon: any; label: string; isActive: boolean }) => (
    <Link 
      to={to} 
      className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors ${
        isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                EsyGrab
              </h1>
            </Link>

            {/* Location - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600 ml-6">
              <MapPin className="h-4 w-4" />
              <span>Deliver to</span>
              <span className="font-medium text-gray-900">Home - 110001</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Search for groceries, fruits, vegetables..." 
                  value={searchQuery} 
                  onChange={e => onSearchChange(e.target.value)} 
                  className="pl-10 w-full" 
                />
              </div>
            </div>

            {/* Right side actions - Desktop only */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">10 mins</span>
              </div>
              
              <Link to="/profile">
                <Button variant="outline" className="hover:bg-green-50 border-green-200">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/cart">
                <Button variant="outline" className="relative hover:bg-green-50 border-green-200">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="flex justify-around items-center py-2 px-4">
          <MobileNavButton 
            to="/" 
            icon={Home} 
            label="Home" 
            isActive={location.pathname === '/'} 
          />
          <MobileNavButton 
            to="/categories" 
            icon={Grid3X3} 
            label="Categories" 
            isActive={location.pathname === '/categories'} 
          />
          <Link to="/cart" className="relative">
            <MobileNavButton 
              to="/cart" 
              icon={ShoppingCart} 
              label="Cart" 
              isActive={location.pathname === '/cart'} 
            />
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems}
              </span>
            )}
          </Link>
          <MobileNavButton 
            to="/profile" 
            icon={User} 
            label="Account" 
            isActive={location.pathname === '/profile'} 
          />
        </div>
      </div>
    </>
  );
};

// Fix missing import
const Package = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2L3 7v10l7 5 7-5V7l-7-5z" />
  </svg>
);

export default Header;
