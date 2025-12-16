import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8 text-white" />,
      title: "Browse Products",
      description:
        "Browse our wide range of groceries and essentials through the EsyGrab website.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-white" />,
      title: "Add to Cart",
      description:
        "Add your favorite items to the cart with just a few clicks.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <MapPin className="h-8 w-8 text-white" />,
      title: "Confirm Address",
      description:
        "Confirm your delivery address and apply promo codes if available.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-white" />,
      title: "Select Payment",
      description: "Select a payment method and place your order securely.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <Truck className="h-8 w-8 text-white" />,
      title: "Receive Order",
      description: "Receive your order in just 10 minutes at your doorstep.",
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">How It Works</h1>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Shopping Made Simple with EsyGrab
          </h2>
          <p className="text-lg text-gray-600">
            It's that simple – shopping made smarter and faster with EsyGrab!
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-gray-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-8 text-center text-white mt-8">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Experience Fast Delivery?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Start shopping now and get your essentials delivered in just 10
            minutes!
          </p>
          <Link to="/">
            <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3">
              Start Shopping
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg p-8 shadow-sm mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Why Choose Our Service?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                🚀 Ultra-Fast Delivery
              </h4>
              <p className="text-gray-600 text-sm">
                Get your essentials delivered within 10 minutes of placing your
                order.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                ✅ Quality Guaranteed
              </h4>
              <p className="text-gray-600 text-sm">
                Fresh products sourced from trusted suppliers with quality
                assurance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                📱 Easy to Use
              </h4>
              <p className="text-gray-600 text-sm">
                Simple and intuitive interface that makes shopping a breeze.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                💰 Great Prices
              </h4>
              <p className="text-gray-600 text-sm">
                Competitive prices with regular discounts and promo codes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
