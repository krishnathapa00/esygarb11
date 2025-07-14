import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Phone, Mail, MessageCircle, HelpCircle, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SupportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Support Request Submitted",
        description: "We'll get back to you within 24 hours",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1000);
  };

  const faqData = [
    {
      question: "How do I start accepting orders?",
      answer: "First, make sure your profile is complete with all required information. Then, toggle your availability status to 'Online' on your dashboard. You'll automatically receive order notifications when available."
    },
    {
      question: "How are delivery earnings calculated?",
      answer: "You earn 15% of the order value for each successful delivery. For example, on a ₹1000 order, you earn ₹150. Earnings are updated in real-time and can be viewed in your Order History."
    },
    {
      question: "What documents do I need for KYC verification?",
      answer: "You need to provide: Full name, phone number, vehicle type, and license number. Make sure all information is accurate as it will be verified by our team."
    },
    {
      question: "How do I update my vehicle information?",
      answer: "Go to your Profile page from the dashboard and update your vehicle type and license number. Save the changes to update your information."
    },
    {
      question: "What if I can't find a customer's address?",
      answer: "Use the 'Navigate' button to open Google Maps with the delivery address. If you still can't find it, use the 'Call Customer' button to contact them directly."
    },
    {
      question: "How do I report an issue with an order?",
      answer: "Contact our support team immediately using the phone number below or submit a support request through this page. Provide your order number for faster assistance."
    },
    {
      question: "When do I get paid?",
      answer: "Payments are processed weekly every Friday. Your earnings from completed deliveries will be transferred to your registered bank account."
    },
    {
      question: "Can I reject an order after accepting it?",
      answer: "While we recommend accepting orders you can complete, if there's an emergency, contact support immediately. Frequent cancellations may affect your partner rating."
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/delivery-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Support & Help</h1>
            <p className="text-muted-foreground">Get help and find answers to common questions</p>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="text-center">
              <Phone className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">Emergency Hotline</CardTitle>
              <CardDescription>24/7 Support</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold text-lg">+91 98765 43210</p>
              <Button 
                className="w-full mt-3" 
                onClick={() => window.open('tel:+919876543210')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Mail className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <CardTitle className="text-lg">Email Support</CardTitle>
              <CardDescription>Response within 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold">support@quickdelivery.com</p>
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => window.open('mailto:support@quickdelivery.com')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">Live Chat</CardTitle>
              <CardDescription>Mon-Sun, 9 AM - 9 PM</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Available</span>
              </div>
              <Button variant="outline" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 justify-start">
                <Clock className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Operating Hours</div>
                  <div className="text-sm text-muted-foreground">Mon-Sun: 7 AM - 11 PM</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 justify-start">
                <MapPin className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Service Areas</div>
                  <div className="text-sm text-muted-foreground">Mumbai, Delhi, Bangalore</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Request</CardTitle>
            <CardDescription>
              Describe your issue and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Provide details about your issue..."
                  rows={5}
                  required
                />
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Find quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Emergency Info */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Emergency Information</CardTitle>
            <CardDescription className="text-red-600">
              In case of emergency during delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-700">Emergency Hotline: +91 98765 43210</p>
                  <p className="text-sm text-red-600">Available 24/7 for urgent issues</p>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-red-600">
                For medical emergencies, contact local emergency services (108) first, then notify our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}