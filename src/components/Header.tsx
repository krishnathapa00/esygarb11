import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, MapPin, Clock, User, Home, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationDetectionPopup from "./LocationDetectionPopup";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "./SearchBar";
import { useCart } from "@/contexts/CartContext";

const Header = () => {
  const [userLocation, setUserLocation] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("esygrab_user_location");
      if (saved && saved !== "null" && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.address) {
          const address = parsed.address as string;
          return address.length > 25
            ? address.split(",")[0].trim() + "..."
            : address;
        }
      }
    } catch (error) {
      console.error("Error parsing location data:", error);
      localStorage.removeItem("esygrab_user_location");
    }
    return "";
  });

  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Show popup only if no location set and popup not dismissed this session
  useEffect(() => {
    const hasLocation = !!userLocation;
    const alreadyHandled = sessionStorage.getItem("locationPopupHandled");

    if (!hasLocation && !alreadyHandled) {
      setShowLocationPopup(true);
      sessionStorage.setItem("locationPopupHandled", "true");
    }
  }, []);

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

  // Dismiss popup but don’t show it again this session
  const handleDismissPopup = () => {
    setShowLocationPopup(false);
    sessionStorage.setItem("locationPopupDismissed", "true");
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

  const shouldShowSearchBar =
    location.pathname === "/" || location.pathname.startsWith("/search");

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/src/assets/esygrab-logo.png" 
                alt="EsyGrab"
                className="w-8 h-8 object-contain"
              />
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
                    {userLocation || "Set Location"}
                  </span>
                </div>
              </Button>
            </div>

            {/* Right side actions - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">10 mins</span>
              </div>

              {user && !location.pathname.includes('/delivery') ? (
                <Link to="/profile">
                  <Button
                    variant="outline"
                    className="hover:bg-green-50 border-green-200"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              ) : user && location.pathname.includes('/delivery') ? null : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="hover:bg-green-50 border-green-200"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Link to={user ? "/cart" : "/login?redirect=/cart"}>
                <Button
                  variant="outline"
                  className="relative hover:bg-green-50 border-green-200"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
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
        onClose={handleDismissPopup}
        onLocationSet={handleLocationSet}
      />

      {/* Mobile Bottom Navigation */}
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
          <div className="relative">
            <MobileNavButton
              to={user ? "/cart" : "/login?redirect=/cart"}
              icon={ShoppingCart}
              label="Cart"
              isActive={location.pathname === "/cart"}
            />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          {user && !location.pathname.includes('/delivery') ? (
            <MobileNavButton
              to="/profile"
              icon={User}
              label="Account"
              isActive={location.pathname === "/profile"}
            />
          ) : user && location.pathname.includes('/delivery') ? null : (
            <MobileNavButton
              to="/login"
              icon={User}
              label="Login"
              isActive={location.pathname === "/login"}
            />
          )}
        </div>
      </div>
    </>
  );
};

const Package = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2L3 7v10l7 5 7-5V7l-7-5z" />
  </svg>
);

export default Header;
