import React from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Footer, Header } from "@/components/shared";

const ReturnsRefunds = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Returns & Refunds
            </h1>
            <p className="text-muted-foreground">
              Your satisfaction is our priority. Learn about our return and
              refund policies.
            </p>
          </div>

          {/* Quick Overview */}
          <Alert className="mb-8">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick Return Policy:</strong> Report issues within 30
              minutes of delivery for immediate resolution. Full refunds
              available for damaged, expired, or incorrect items.
            </AlertDescription>
          </Alert>

          {/* Return Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-primary" />
                Return Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">What can be returned?</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Damaged or spoiled products</li>
                    <li>Expired items (check expiry date on delivery)</li>
                    <li>Wrong items delivered</li>
                    <li>Missing items from your order</li>
                    <li>Poor quality products that don't meet standards</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    What cannot be returned?
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Personal care items that have been opened</li>
                    <li>Products returned after 30 minutes of delivery</li>
                    <li>Items that were correctly delivered as per order</li>
                    <li>Products damaged due to mishandling by customer</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Return Process</h3>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>
                      Contact our support team within 30 minutes of delivery
                    </li>
                    <li>Provide your order number and photos of the issue</li>
                    <li>Our team will verify and approve the return</li>
                    <li>Schedule pickup or get immediate refund approval</li>
                    <li>
                      Receive refund or replacement as per your preference
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Refund Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Refund Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Immediate cash refund
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium">Digital Payments</p>
                        <p className="text-sm text-muted-foreground">
                          2-5 business days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium">Bank Transfers</p>
                        <p className="text-sm text-muted-foreground">
                          3-7 business days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Refund Methods</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      • Refunds will be processed to the original payment method
                    </p>
                    <p>• For cash payments, immediate cash refund available</p>
                    <p>
                      • Digital wallet refunds (eSewa, Khalti) within 24 hours
                    </p>
                    <p>• Bank card refunds may take 3-7 business days</p>
                    <p>• Store credit available for faster processing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Scenarios */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Common Return Scenarios</CardTitle>
              <CardDescription>
                How we handle typical return situations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      <h4 className="font-medium">Damaged Products</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Immediate replacement or full refund. No questions asked
                      for clearly damaged items.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-orange-600 mr-2" />
                      <h4 className="font-medium">Wrong Items</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Free pickup of wrong items and immediate delivery of
                      correct items at no extra cost.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      <h4 className="font-medium">Missing Items</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Immediate delivery of missing items or partial refund for
                      missing products.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <h4 className="font-medium">Quality Issues</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full refund or replacement for items that don't meet our
                      quality standards.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help with Returns?</CardTitle>
              <CardDescription>
                Our customer support team is here to help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-muted-foreground">
                      +9779865053325 / +9779868293232
                    </p>
                    <p className="text-sm text-muted-foreground">
                      7 AM - 10 PM, 7 days a week
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-muted-foreground">support@esygrab.com</p>
                    <p className="text-sm text-muted-foreground">
                      Response within 2 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  <strong>Quick Tip:</strong> Have your order number ready when
                  contacting support for faster resolution.
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

export default ReturnsRefunds;
