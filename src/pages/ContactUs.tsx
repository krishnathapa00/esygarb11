import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Clock, MessageSquare, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const ContactUs = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeadphonesIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">We'd Love to Hear from You!</h2>
          <p className="text-lg text-gray-600">
            Have questions, feedback, or need assistance? Our customer support team is here to help you 24/7.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Contact Details */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Office Address</h4>
                  <p className="text-gray-600">New Baneshwor, Kathmandu, Nepal</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Phone Number</h4>
                  <p className="text-gray-600">+9779865053325 / +9779868293232</p>
                  <p className="text-sm text-gray-500">Available 7 AM - 10 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Email Address</h4>
                  <p className="text-gray-600">support@esygrab.com</p>
                  <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Customer Support Hours</h4>
                  <p className="text-gray-600">7 days a week</p>
                  <p className="text-gray-600">7:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+977-98XXXXXXXX"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a subject</option>
                  <option value="order-issue">Order Issue</option>
                  <option value="delivery-problem">Delivery Problem</option>
                  <option value="payment-issue">Payment Issue</option>
                  <option value="product-quality">Product Quality</option>
                  <option value="app-feedback">App Feedback</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What are your delivery hours?</h4>
              <p className="text-gray-600 text-sm mb-4">We deliver 7 days a week from 7:00 AM to 10:00 PM.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How fast is your delivery?</h4>
              <p className="text-gray-600 text-sm mb-4">We deliver within 10 minutes of order confirmation.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm mb-4">We accept Cash on Delivery, eSewa, Khalti, and bank transfers.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How can I track my order?</h4>
              <p className="text-gray-600 text-sm mb-4">You can track your order in real-time through our website after placing an order.</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">Need more help?</p>
            <Link to="/help-center">
              <Button variant="outline">
                Visit Help Center
              </Button>
            </Link>
          </div>
        </div>

        {/* Priority Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Your Satisfaction is Our Top Priority!</h4>
              <p className="text-green-700 text-sm">
                We're committed to providing exceptional customer service. If you have any concerns or feedback, 
                please don't hesitate to reach out. We value your opinion and are always working to improve your experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;