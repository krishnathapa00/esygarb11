import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared";

const SupportPage = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h2>
          <p className="text-lg text-gray-600">
            We're here to help! Find answers to common questions or get in touch
            with our support team.
          </p>
        </div>

        {/* Quick Help Links */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link to="/help-center">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Help Center
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Browse frequently asked questions
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/returns-refunds">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Returns & Refunds
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Learn about our return policy
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Contact Options */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Contact Our Support Team
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Call Us
              </h4>
              <p className="text-gray-600 mb-4">
                +977-9761158650
                <br />
                <span className="text-sm">7 AM - 10 PM, 7 days a week</span>
              </p>
              <a href="tel:+977-9761158650">
                <Button className="bg-green-600 hover:bg-green-700">
                  Call Now
                </Button>
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Email Us
              </h4>
              <p className="text-gray-600 mb-4">
                support@esygrab.com
                <br />
                <span className="text-sm">We'll respond within 24 hours</span>
              </p>
              <a href="mailto:support@esygrab.com">
                <Button variant="outline">Send Email</Button>
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Live Chat
              </h4>
              <p className="text-gray-600 mb-4">
                Chat with our support team
                <br />
                <span className="text-sm">Available 7 AM - 10 PM</span>
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <div className="flex items-start gap-3">
            <Clock className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">
                Support Hours
              </h4>
              <p className="text-green-700 text-sm">
                Our customer support team is available 7 days a week from 7:00
                AM to 10:00 PM. For urgent issues outside these hours, please
                email us and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
