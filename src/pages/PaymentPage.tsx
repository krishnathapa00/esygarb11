import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, CreditCard, Smartphone, Building2, Banknote, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [selectedPayment, setSelectedPayment] = useState("esewa");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 299,
      originalPrice: 399,
      duration: "30 days",
      features: [
        "Free delivery on orders above Rs. 500",
        "5% discount on all products",
        "Priority customer support",
        "Access to exclusive deals"
      ],
      badge: "Most Popular",
      badgeColor: "bg-green-500"
    },
    {
      id: "premium",
      name: "Premium Plan", 
      price: 599,
      originalPrice: 799,
      duration: "60 days",
      features: [
        "Free delivery on all orders",
        "10% discount on all products",
        "24/7 priority support",
        "Early access to new products",
        "Monthly surprise box"
      ],
      badge: "Best Value",
      badgeColor: "bg-purple-500"
    },
    {
      id: "family",
      name: "Family Plan",
      price: 999,
      originalPrice: 1299,
      duration: "90 days",
      features: [
        "Everything in Premium",
        "15% discount on all products",
        "Family sharing (up to 5 members)",
        "Bulk order discounts",
        "Personal shopping assistant"
      ],
      badge: "Family Saver",
      badgeColor: "bg-blue-500"
    }
  ];

  const paymentMethods = [
    {
      id: "esewa",
      name: "eSewa",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Pay with eSewa wallet"
    },
    {
      id: "khalti",
      name: "Khalti",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Pay with Khalti wallet"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: <Building2 className="h-5 w-5" />,
      description: "Direct bank transfer"
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Visa, Mastercard accepted"
    }
  ];

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/");
    }, 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Choose Your Plan
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome to EsyGrab! Select a subscription plan to get started.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plans Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Select a Plan</h2>
            <div className="grid gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? "ring-2 ring-green-500 bg-green-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPlan === plan.id 
                            ? "bg-green-500 border-green-500" 
                            : "border-gray-300"
                        }`}>
                          {selectedPlan === plan.id && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <p className="text-sm text-gray-600">{plan.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">
                            Rs. {plan.price}
                          </span>
                          <span className="text-lg text-gray-400 line-through">
                            Rs. {plan.originalPrice}
                          </span>
                        </div>
                        <Badge className={`${plan.badgeColor} text-white hover:${plan.badgeColor} mt-1`}>
                          {plan.badge}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPayment === method.id
                        ? "ring-2 ring-green-500 bg-green-50"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPayment === method.id 
                            ? "bg-green-500 border-green-500" 
                            : "border-gray-300"
                        }`}>
                          {selectedPayment === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-green-600">
                            {method.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{method.name}</p>
                            <p className="text-xs text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">{selectedPlanData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{selectedPlanData?.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price</span>
                    <span className="line-through text-gray-400">
                      Rs. {selectedPlanData?.originalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600 font-medium">
                      -Rs. {(selectedPlanData?.originalPrice || 0) - (selectedPlanData?.price || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      Rs. {selectedPlanData?.price}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3"
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay Rs. ${selectedPlanData?.price}`
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By proceeding, you agree to our Terms of Service and Privacy Policy.
                  Your subscription will auto-renew unless cancelled.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;