import React from 'react';
import { FileText, Users, ShoppingCart, CreditCard, Truck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Introduction */}
          <Alert className="mb-8">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Agreement:</strong> By using EsyGrab's services, you agree to these terms. 
              Please read them carefully before placing your first order.
            </AlertDescription>
          </Alert>

          {/* Acceptance of Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  By accessing and using EsyGrab's website, mobile application, or services, you acknowledge 
                  that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Eligibility</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>You must be at least 18 years old to use our services</li>
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining the confidentiality of your account</li>
                    <li>You agree to notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
                Our Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  EsyGrab operates a quick-commerce platform delivering groceries and daily essentials 
                  within 10-15 minutes in select areas of Nepal.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">What We Provide</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Online ordering platform</li>
                      <li>Fast delivery services</li>
                      <li>Customer support</li>
                      <li>Order tracking</li>
                      <li>Multiple payment options</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Service Limitations</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Service available in select areas only</li>
                      <li>Product availability subject to stock</li>
                      <li>Delivery times may vary due to weather/traffic</li>
                      <li>Minimum order requirements may apply</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ordering and Payments */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Ordering and Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Order Process</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Orders are confirmed upon successful payment processing</li>
                    <li>We reserve the right to refuse or cancel orders</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Product substitutions may occur due to availability</li>
                    <li>Order modifications may not be possible after confirmation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Payment Terms</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Payment is required at the time of order placement</li>
                    <li>We accept cash on delivery, digital wallets, and online payments</li>
                    <li>All prices include applicable taxes unless stated otherwise</li>
                    <li>Promotional codes have terms and conditions that apply</li>
                    <li>Refunds will be processed according to our refund policy</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Pricing</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>All prices are in Nepalese Rupees (NPR)</li>
                    <li>Delivery charges apply as per current rates</li>
                    <li>New users may receive promotional pricing</li>
                    <li>We reserve the right to correct pricing errors</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-primary" />
                Delivery Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Delivery Commitment</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>We aim to deliver within 10-15 minutes in our service areas</li>
                    <li>Delivery times are estimates and may vary</li>
                    <li>Weather conditions and other factors may cause delays</li>
                    <li>Accurate delivery address is required for successful delivery</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Customer Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Be available to receive your order</li>
                    <li>Provide accurate contact information and address</li>
                    <li>Check items upon delivery for any issues</li>
                    <li>Report any problems immediately to customer support</li>
                    <li>Provide access to delivery location</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Delivery Failure</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>If delivery cannot be completed, order may be canceled</li>
                    <li>Customer will be contacted for re-delivery options</li>
                    <li>Additional charges may apply for re-delivery attempts</li>
                    <li>Refunds will be processed for failed deliveries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                User Conduct and Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Acceptable Use</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Use our services only for lawful purposes</li>
                    <li>Provide accurate and truthful information</li>
                    <li>Respect our delivery partners and staff</li>
                    <li>Follow all applicable laws and regulations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Prohibited Activities</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Creating false accounts or providing false information</li>
                    <li>Attempting to manipulate pricing or promotional systems</li>
                    <li>Harassment or abuse of delivery partners or staff</li>
                    <li>Using automated systems to place orders</li>
                    <li>Attempting to gain unauthorized access to our systems</li>
                    <li>Violating any applicable laws or regulations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  EsyGrab's liability is limited to the maximum extent permitted by law:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our total liability shall not exceed the amount you paid for the order</li>
                  <li>We do not guarantee uninterrupted or error-free service</li>
                  <li>Product information is provided by suppliers and may contain errors</li>
                  <li>We are not responsible for third-party website content or services</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Changes will be effective 
                  immediately upon posting on our website.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Continued use of our services constitutes acceptance of new terms</li>
                  <li>Significant changes will be communicated via email or website notice</li>
                  <li>You should review terms periodically for updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About These Terms?</CardTitle>
              <CardDescription>Contact us for clarification or concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Legal Team</p>
                  <p className="text-muted-foreground">legal@esygrab.com</p>
                </div>
                <div>
                  <p className="font-medium">Customer Support</p>
                  <p className="text-muted-foreground">support@esygrab.com</p>
                  <p className="text-muted-foreground">+977-9761158650</p>
                </div>
                <div>
                  <p className="font-medium">Office Address</p>
                  <p className="text-muted-foreground">
                    New Baneshwor, Kathmandu, Nepal
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  These terms constitute the entire agreement between you and EsyGrab regarding 
                  the use of our services.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;