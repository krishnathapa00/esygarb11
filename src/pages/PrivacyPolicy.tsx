import React from "react";
import { Shield, Eye, Lock, Share2, UserCheck, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Footer, Header } from "@/components/shared";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Introduction */}
          <Alert className="mb-8">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Your Privacy Matters:</strong> EsyGrab is committed to
              protecting your personal information. This policy explains how we
              collect, use, and safeguard your data.
            </AlertDescription>
          </Alert>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      Name and contact information (phone number, email address)
                    </li>
                    <li>Delivery addresses and location data</li>
                    <li>
                      Payment information (securely processed by third-party
                      providers)
                    </li>
                    <li>Order history and preferences</li>
                    <li>Account credentials and profile information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Usage Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      Device information (IP address, browser type, operating
                      system)
                    </li>
                    <li>Website usage patterns and navigation data</li>
                    <li>Search queries and product interactions</li>
                    <li>Communication logs with customer support</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Location Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      GPS coordinates for delivery purposes (with your consent)
                    </li>
                    <li>Delivery addresses you provide</li>
                    <li>Service area verification data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Service Delivery</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Process and fulfill your orders</li>
                    <li>Coordinate delivery logistics</li>
                    <li>Provide customer support</li>
                    <li>Send order confirmations and updates</li>
                    <li>Handle returns and refunds</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Service Improvement</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Analyze usage patterns to improve our service</li>
                    <li>Personalize your shopping experience</li>
                    <li>Develop new features and services</li>
                    <li>Conduct market research and analytics</li>
                    <li>Prevent fraud and ensure security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-primary" />
                How We Protect Your Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Encryption</h4>
                    <p className="text-sm text-muted-foreground">
                      All sensitive data is encrypted in transit and at rest
                      using industry-standard protocols.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Access Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Strict access controls ensure only authorized personnel
                      can access your information.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Secure Infrastructure</h4>
                    <p className="text-sm text-muted-foreground">
                      Our systems are hosted on secure, monitored infrastructure
                      with regular security updates.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Regular Audits</h4>
                    <p className="text-sm text-muted-foreground">
                      We conduct regular security audits and vulnerability
                      assessments.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-primary" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">
                    We Share Information With:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <strong>Delivery Partners:</strong> Name, phone number,
                      and delivery address for order fulfillment
                    </li>
                    <li>
                      <strong>Payment Processors:</strong> Securely processed
                      payment information (we don't store card details)
                    </li>
                    <li>
                      <strong>Service Providers:</strong> Third-party services
                      that help us operate our business
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> When required by law
                      or to protect our rights
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">We Never:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Sell your personal information to third parties</li>
                    <li>
                      Share your data for marketing purposes without consent
                    </li>
                    <li>Provide unnecessary access to your information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Data Rights</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Data portability</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">How to Exercise Rights</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Contact us at privacy@esygrab.com</li>
                    <li>Use account settings to update information</li>
                    <li>Call our support team at +977-9761158650</li>
                    <li>Submit requests through our website</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to improve your
                  experience:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic
                    website functionality
                  </li>
                  <li>
                    <strong>Performance Cookies:</strong> Help us understand how
                    you use our site
                  </li>
                  <li>
                    <strong>Functional Cookies:</strong> Remember your
                    preferences and settings
                  </li>
                  <li>
                    <strong>Analytics:</strong> Help us improve our service (can
                    be disabled)
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  You can control cookie preferences in your browser settings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Privacy?</CardTitle>
              <CardDescription>
                Contact our privacy team for any concerns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Privacy Officer</p>
                  <p className="text-muted-foreground">privacy@esygrab.com</p>
                </div>
                <div>
                  <p className="font-medium">Office Address</p>
                  <p className="text-muted-foreground">
                    New Baneshwor, Kathmandu, Nepal
                  </p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">+977-9761158650</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This privacy policy may be updated periodically. We'll notify
                  you of significant changes via email or prominent website
                  notice.
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

export default PrivacyPolicy;

