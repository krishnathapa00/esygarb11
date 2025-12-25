import React from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Footer, Header } from "@/components/shared";

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const faqs = [
    {
      id: 1,
      question: "How fast is delivery?",
      answer:
        "We deliver your orders within 10 minutes in our service areas. Our fast delivery is powered by our network of local darkstores and efficient delivery partners.",
    },
    {
      id: 2,
      question: "What areas do you deliver to?",
      answer:
        "We currently deliver in Kathmandu, Lalitpur, and Bhaktapur. We're constantly expanding our service areas. Check our website for the latest coverage areas.",
    },
    {
      id: 3,
      question: "What are your delivery charges?",
      answer:
        "Standard delivery fee is Rs 15 per order. New users may get promotional delivery rates. Check our current delivery settings for any ongoing promotions.",
    },
    {
      id: 4,
      question: "How can I track my order?",
      answer:
        "You can track your order in real-time through our website. You'll receive updates at each stage: order confirmed, being prepared, out for delivery, and delivered.",
    },
    {
      id: 5,
      question: "What payment methods do you accept?",
      answer:
        "We accept cash on delivery, eSewa, Khalti, and other popular digital payment methods. More payment options are being added regularly.",
    },
    {
      id: 6,
      question: "Can I cancel my order?",
      answer:
        "You can cancel your order before it's confirmed (usually within 1-2 minutes of placing it). Once the order is being prepared, cancellation may not be possible.",
    },
    {
      id: 7,
      question: "What if an item is out of stock?",
      answer:
        "If an item is out of stock, we'll immediately notify you and provide alternatives. You can choose to replace it with a similar item or remove it from your order.",
    },
    {
      id: 8,
      question: "How do I apply promo codes?",
      answer:
        "Enter your promo code during checkout in the 'Promo Code' section. The discount will be automatically applied to your order total.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Help Center
            </h1>
            <p className="text-muted-foreground mb-6">
              Find answers to common questions and get help with your EsyGrab
              experience
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="text-center">
                <Phone className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Call Us</CardTitle>
                <CardDescription>Get immediate help</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-medium">+9779865053325 / +9779868293232</p>
                <p className="text-sm text-muted-foreground">
                  5 PM - 9 PM, 7 days a week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Email Support</CardTitle>
                <CardDescription>We'll respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-medium">support@esygrab.com</p>
                <p className="text-sm text-muted-foreground">
                  For detailed inquiries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Live Chat</CardTitle>
                <CardDescription>Chat with our team</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full">Start Chat</Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Available during business hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find quick answers to the most common questions about EsyGrab
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <Collapsible key={faq.id}>
                    <CollapsibleTrigger
                      onClick={() => toggleExpanded(faq.id)}
                      className="flex items-center justify-between w-full p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedItems.includes(faq.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 py-3 text-muted-foreground">
                      {faq.answer}
                    </CollapsibleContent>
                  </Collapsible>
                ))}

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found for "{searchTerm}". Try different keywords
                    or contact support.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
