
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Clock, User, Home, Grid3X3, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LocationDetectionPopup from './LocationDetectionPopup';

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
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('esygrab_user_location');
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.address) {
          return parsed.address.length > 20 
            ? parsed.address.split(',')[0].trim() + '...' 
            : parsed.address;
        }
      }
    } catch (error) {
      console.error('Error parsing location data:', error);
      localStorage.removeItem('esygrab_user_location');
    }
    return 'Set Location';
  });
  const location = useLocation();

  const handleLocationSet = (location: string) => {
    let simplifiedLocation = location;
    if (location.length > 20) {
      const parts = location.split(',');
      if (parts.length > 1) {
        simplifiedLocation = parts[0].trim() + '...';
      } else {
        simplifiedLocation = location.substring(0, 17) + '...';
      }
    }
    
    setUserLocation(simplifiedLocation);
    try {
      localStorage.setItem('esygrab_user_location', JSON.stringify({ address: location }));
    } catch (error) {
      console.error('Error saving location:', error);
    }
    setShowLocationPopup(false);
  };

  const MobileNavButton = ({ to, icon: Icon, label, isActive }: { to: string; icon: any; label: string; isActive: boolean }) => (
    <Link 
      to={to} 
      className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors min-w-0 ${
        isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="text-xs font-medium truncate">{label}</span>
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                EsyGrab
              </h1>
            </Link>

            {/* Location - All screens */}
            <div className="flex items-center flex-1 mx-2 sm:mx-4 max-w-xs sm:max-w-none">
              <Button
                variant="ghost"
                onClick={() => setShowLocationPopup(true)}
                className="flex items-center space-x-1 sm:space-x-2 hover:bg-green-50 text-xs sm:text-sm p-2 min-w-0"
              >
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <span className="text-xs text-gray-500 block hidden sm:block">Deliver to</span>
                  <span className="font-medium text-gray-900 text-xs sm:text-sm truncate block">{userLocation}</span>
                </div>
              </Button>
            </div>

            {/* Right side actions - Desktop only */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">10 mins</span>
              </div>
              
              <Link to="/profile">
                <Button variant="outline" size="sm" className="hover:bg-green-50 border-green-200">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/cart">
                <Button variant="outline" size="sm" className="relative hover:bg-green-50 border-green-200">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Mobile delivery time */}
            <div className="lg:hidden flex items-center space-x-1 text-xs text-green-600 flex-shrink-0">
              <Clock className="h-3 w-3" />
              <span className="font-medium">10m</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar Section - Below Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search groceries, fruits..." 
              value={searchQuery} 
              onChange={e => onSearchChange(e.target.value)} 
              className="pl-10 sm:pl-12 w-full h-10 sm:h-12 text-sm sm:text-base rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 transition-all duration-200" 
            />
          </div>
        </div>
      </div>

      {/* Location Detection Popup */}
      <LocationDetectionPopup
        isOpen={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        onLocationSet={handleLocationSet}
      />

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg safe-area-pb">
        <div className="flex justify-around items-center py-1 px-2">
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
          <Link to="/cart" className="relative flex-shrink-0">
            <MobileNavButton 
              to="/cart" 
              icon={ShoppingCart} 
              label="Cart" 
              isActive={location.pathname === '/cart'} 
            />
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartItems > 9 ? '9+' : cartItems}
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
