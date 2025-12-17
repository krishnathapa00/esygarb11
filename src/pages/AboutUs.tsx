import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared";

const AboutUs = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">About EsyGrab</h1>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nepal's Fastest Quick-Commerce Platform
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              EsyGrab is Nepal's fastest and most reliable quick-commerce
              platform, delivering groceries and daily essentials within just 10
              minutes. We are on a mission to make everyday shopping effortless,
              saving you time so you can focus on what truly matters. EsyGrab
              ensures you get what you need, when you need it.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Our Mission
              </h3>
            </div>
            <p className="text-gray-600">
              To revolutionize the way people shop for daily essentials in Nepal
              by providing ultra-fast delivery, quality products, and
              exceptional customer service.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Our Vision
              </h3>
            </div>
            <p className="text-gray-600">
              To become Nepal's most trusted and convenient shopping platform,
              making quality products accessible to everyone within minutes.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose EsyGrab?
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                10 Minutes Delivery
              </h4>
              <p className="text-gray-600 text-sm">
                Ultra-fast delivery that gets your essentials to you in minutes,
                not hours.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Quality Products
              </h4>
              <p className="text-gray-600 text-sm">
                Fresh groceries and daily essentials sourced from trusted
                suppliers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Wide Coverage
              </h4>
              <p className="text-gray-600 text-sm">
                Serving major areas in Nepal with plans to expand nationwide.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h3>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>New Baneshwor, Kathmandu</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>+977-9761158650</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✉️</span>
              <span>support@esygrab.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

