import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  MapPin,
  Clock,
  User,
  Home,
  Grid3X3,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationDetectionPopup from "./LocationDetectionPopup";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "./SearchBar";

interface HeaderProps {
  cartItems: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearchBar?: boolean;
}

const Header = ({ cartItems, searchQuery, onSearchChange }: HeaderProps) => {
  const mockProductNames = [
    "Fresh Bananas",
    "Fresh Tomatoes",
    "Fresh Spinach",
    "Fresh Milk",
    "Almond Milk",
    "Organic Mangoes",
    "Brown Bread",
    "Peanut Butter",
    "Farm Eggs",
    "Greek Yogurt",
  ];

  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("esygrab_user_location");
      if (saved && saved !== "null" && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.address) {
          return parsed.address.length > 25
            ? parsed.address.split(",")[0].trim() + "..."
            : parsed.address;
        }
      }
    } catch (error) {
      console.error("Error parsing location data:", error);
      // Clear corrupted data
      localStorage.removeItem("esygrab_user_location");
    }
    return "Set Location";
  });
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSearchInput = (query: string) => {
    onSearchChange(query);
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = mockProductNames
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
    setSuggestions(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/search?query=${searchQuery}`);
      setSuggestions([]);
    }
  };

  const handleLocationSet = (location: string) => {
    let simplifiedLocation = location;
    if (location.length > 25) {
      const parts = location.split(",");
      if (parts.length > 1) {
        simplifiedLocation = parts[0].trim() + "...";
      } else {
        simplifiedLocation = location.substring(0, 22) + "...";
      }
    }

    setUserLocation(simplifiedLocation);
    try {
      localStorage.setItem(
        "esygrab_user_location",
        JSON.stringify({ address: location })
      );
    } catch (error) {
      console.error("Error saving location:", error);
    }
    setShowLocationPopup(false);
  };

  const MobileNavButton = ({
    to,
    icon: Icon,
    label,
    isActive,
  }: {
    to: string;
    icon: any;
    label: string;
    isActive: boolean;
  }) => (
    <Link
      to={to}
      className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "text-green-600 bg-green-50"
          : "text-gray-600 hover:text-green-600"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );

  // Show search bar ONLY on homepage
  const shouldShowSearchBar =
    location.pathname === "/" || location.pathname.startsWith("/search");

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

            {/* Location - Desktop */}
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 ml-8 flex-1">
              <Button
                variant="ghost"
                onClick={() => setShowLocationPopup(true)}
                className="flex items-center space-x-2 hover:bg-green-50"
              >
                <MapPin className="h-4 w-4 text-green-600" />
                <div className="text-left">
                  <span className="text-xs text-gray-500 block">
                    Deliver to
                  </span>
                  <span className="font-medium text-gray-900 text-sm">
                    {userLocation}
                  </span>
                </div>
              </Button>
            </div>

            {/* Right side actions - Desktop only */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">10 mins</span>
              </div>

              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="hover:bg-green-50 border-green-200"
                    onClick={logout}
                  >
                    <span className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline">Logout</span>
                    </span>
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="hover:bg-green-50 border-green-200"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Link to="/cart">
                <Button
                  variant="outline"
                  className="relative hover:bg-green-50 border-green-200"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Mobile Location Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationPopup(true)}
                className="p-2"
              >
                <MapPin className="h-5 w-5 text-green-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar Section - ONLY show on homepage */}
      {shouldShowSearchBar && (
        <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <SearchBar />
          </div>
        </div>
      )}

      {/* Location Detection Popup */}
      <LocationDetectionPopup
        isOpen={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        onLocationSet={handleLocationSet}
      />

      {/* Mobile Bottom Navigation - Always visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="flex justify-around items-center py-2 px-4">
          <MobileNavButton
            to="/"
            icon={Home}
            label="Home"
            isActive={location.pathname === "/"}
          />
          <MobileNavButton
            to="/categories"
            icon={Grid3X3}
            label="Categories"
            isActive={location.pathname === "/categories"}
          />
          <Link to="/cart" className="relative">
            <MobileNavButton
              to="/cart"
              icon={ShoppingCart}
              label="Cart"
              isActive={location.pathname === "/cart"}
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
            isActive={location.pathname === "/profile"}
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
