import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import EsyLogo from "@/assets/logo/Esy.jpg";

const Footer = () => {
  const { data: categories = [] } = useCategories();

  return (
    <footer className="hidden md:block bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left - Company Info */}
          <div className="text-left">
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
            <p className="text-gray-300 text-sm leading-relaxed mt-4">
              Nepal's leading quick commerce company delivering fresh groceries
              to your doorstep in just 10 minutes. Quality products, unbeatable
              convenience.
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <Phone className="h-4 w-4 text-green-400 mt-1" />
                <span>+9779865053325 / +9779868293232</span>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-green-400 mt-1" />
                <span>support@esygrab.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-green-400 mt-1" />
                <span>New Baneshwor, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Center - Categories */}
          <div className="flex justify-center">
            <div className="text-left">
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <div className="space-y-2">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    to={`/subcategories/${category.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="block text-sm text-gray-300 hover:text-green-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Support */}
          <div className="flex justify-end">
            <div className="text-left">
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link
                  to="/help-center"
                  className="block text-sm text-gray-300 hover:text-green-400"
                >
                  Help Center
                </Link>
                <Link
                  to="/returns-refunds"
                  className="block text-sm text-gray-300 hover:text-green-400"
                >
                  Returns & Refunds
                </Link>
                <Link
                  to="/privacy-policy"
                  className="block text-sm text-gray-300 hover:text-green-400"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms-of-service"
                  className="block text-sm text-gray-300 hover:text-green-400"
                >
                  Terms of Service
                </Link>
                <div className="pt-2">
                  <div className="flex items-start space-x-2 text-sm text-gray-300">
                    <Clock className="h-4 w-4 text-green-400 mt-1" />
                    <span>24/7 Customer Support</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-gray-300 mt-2">
                    <Phone className="h-4 w-4 text-green-400 mt-1" />
                    <span>WhatsApp: +9779865053325</span>{" "}
                  </div>
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
                href="https://www.facebook.com/profile.php?id=61578579404748"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="Facebook"
              >
                <img
                  src="/images/Facebook.png"
                  alt="Facebook"
                  className="h-7 w-7 rounded-full"
                />
              </a>
              <a
                href="https://www.instagram.com/esygrab_official/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="Instagram"
              >
                <img
                  src="/images/Instagram.png"
                  alt="Instagram"
                  className="h-7 w-7 rounded-full"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/esygrab/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="LinkedIn"
              >
                <img
                  src="/images/Linkedin.png"
                  alt="TikTok"
                  className="h-7 w-7 rounded-full"
                />
              </a>
              <a
                href="https://www.tiktok.com/@esygrab_official"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="TikTok"
              >
                <img
                  src="/images/Tiktok.png"
                  alt="TikTok"
                  className="h-7 w-7 rounded-full"
                />
              </a>
            </div>

            {/* App Links */}
            <div className="flex items-center space-x-3">
              <img src="/images/AppStore.png" alt="App Store" className="h-8" />
              <img
                src="/images/GooglePlay.png"
                alt="Google Play"
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
