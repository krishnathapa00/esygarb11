import React from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import EsyLogo from "@/assets/logo/Esy.jpg";

const Footer = () => {
  const { data: categories = [] } = useCategories();

  return (
    <footer className="hidden md:block bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <img
                  src={EsyLogo}
                  alt="EsyGrab Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">EsyGrab</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Nepal's leading quick commerce company delivering fresh groceries
              to your doorstep in just 10 minutes. Quality products, unbeatable
              convenience.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-green-400" />
                <span>+9779865053325 / +9779868293232</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-green-400" />
                <span>support@esygrab.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-green-400" />
                <span>New Baneshwor, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Categories (replacing Quick Links) */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Categories</h4>
            <div className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  to={`/subcategories/${category.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="block text-gray-300 hover:text-green-400 transition-colors text-sm"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* More Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">More Categories</h4>
            <div className="space-y-2">
              {categories.slice(5, 10).map((category) => (
                <Link
                  key={category.id}
                  to={`/subcategories/${category.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="block text-gray-300 hover:text-green-400 transition-colors text-sm"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <div className="space-y-2">
              <Link
                to="/help-center"
                className="block text-gray-300 hover:text-green-400 transition-colors text-sm"
              >
                Help Center
              </Link>
              <Link
                to="/returns-refunds"
                className="block text-gray-300 hover:text-green-400 transition-colors text-sm"
              >
                Returns & Refunds
              </Link>
              <Link
                to="/privacy-policy"
                className="block text-gray-300 hover:text-green-400 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="block text-gray-300 hover:text-green-400 transition-colors text-sm"
              >
                Terms of Service
              </Link>
              <div className="pt-2">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              @2025 EsyGrab by Virkuti Online Shopping Pvt.Ltd
            </div>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>

            {/* App Links */}
            <div className="flex items-center space-x-3">
              <img src="/placeholder.svg" alt="App Store" className="h-8" />
              <img src="/placeholder.svg" alt="Google Play" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
