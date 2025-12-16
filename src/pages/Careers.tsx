import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Users,
  TrendingUp,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared";

const Careers = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const jobOpenings = [
    {
      id: "delivery-partners",
      title: "Delivery Partners (Riders)",
      type: "Full-time / Part-time",
      location: "Kathmandu Valley",
      description:
        "Join our delivery team and be part of Nepal's fastest delivery network. Flexible hours, competitive pay, and growth opportunities.",
      requirements: [
        "Valid driving license",
        "Own motorcycle/scooter",
        "Good knowledge of Kathmandu roads",
        "Smartphone with internet connection",
        "Age 18-45 years",
      ],
    },
    {
      id: "warehouse-staff",
      title: "Warehouse & Inventory Staff",
      type: "Full-time",
      location: "New Baneshwor, Kathmandu",
      description:
        "Manage inventory, pack orders, and ensure quality control in our darkstore operations.",
      requirements: [
        "High school diploma or equivalent",
        "Attention to detail",
        "Physical ability to lift packages",
        "Basic computer skills",
        "Teamwork skills",
      ],
    },
    {
      id: "customer-support",
      title: "Customer Support Executives",
      type: "Full-time",
      location: "New Baneshwor, Kathmandu",
      description:
        "Provide excellent customer service through phone, chat, and email support.",
      requirements: [
        "Excellent communication skills in Nepali and English",
        "Customer service experience preferred",
        "Computer literacy",
        "Problem-solving skills",
        "Patient and friendly attitude",
      ],
    },
    {
      id: "tech-developers",
      title: "Tech & Product Developers",
      type: "Full-time",
      location: "New Baneshwor, Kathmandu",
      description:
        "Build and maintain our platform, mobile apps, and backend systems.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "Experience with React, Node.js, or similar technologies",
        "Understanding of databases and APIs",
        "Problem-solving mindset",
        "Portfolio of previous work",
      ],
    },
    {
      id: "marketing-operations",
      title: "Marketing & Operations Specialists",
      type: "Full-time",
      location: "New Baneshwor, Kathmandu",
      description:
        "Drive growth through digital marketing, partnerships, and operational excellence.",
      requirements: [
        "Bachelor's degree in Marketing, Business, or related field",
        "Digital marketing experience",
        "Understanding of social media platforms",
        "Data analysis skills",
        "Creative thinking and initiative",
      ],
    },
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      title: "Career Growth",
      description:
        "Fast-track your career in a rapidly growing startup environment",
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Great Team",
      description: "Work with passionate, creative, and ambitious individuals",
    },
    {
      icon: <Briefcase className="h-6 w-6 text-green-600" />,
      title: "Competitive Pay",
      description: "Attractive salary packages with performance bonuses",
    },
    {
      icon: <Clock className="h-6 w-6 text-green-600" />,
      title: "Flexible Hours",
      description: "Work-life balance with flexible working arrangements",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Careers at EsyGrab
          </h1>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-8 text-white mb-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">
              Join the Future of Commerce in Nepal
            </h2>
            <p className="text-lg opacity-90 mb-6">
              At EsyGrab, we're building the future of commerce in Nepal. We're
              looking for passionate, creative, and ambitious individuals to
              join our team and shape the quick-commerce revolution.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>New Baneshwor, Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>careers@esygrab.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why Join Us */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Join EsyGrab?
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Job Openings */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Open Positions
          </h3>

          <div className="space-y-4">
            {jobOpenings.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {job.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSelectedJob(selectedJob === job.id ? null : job.id)
                    }
                  >
                    {selectedJob === job.id ? "Hide Details" : "View Details"}
                  </Button>
                </div>

                <p className="text-gray-600 mb-4">{job.description}</p>

                {selectedJob === job.id && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Requirements:
                    </h5>
                    <ul className="space-y-2 mb-6">
                      {job.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-gray-600"
                        >
                          <span className="text-green-600 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="mailto:careers@esygrab.com?subject=Application for [Position Name]"
                      className="inline-block"
                    >
                      <Button className="bg-green-600 hover:bg-green-700">
                        Apply Now
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            How to Apply
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Send Your Resume
              </h4>
              <p className="text-gray-600 text-sm">
                Email your resume to careers@esygrab.com with the position title
                in the subject line.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Initial Screening
              </h4>
              <p className="text-gray-600 text-sm">
                Our HR team will review your application and contact you if your
                profile matches our requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Interview Process
              </h4>
              <p className="text-gray-600 text-sm">
                Participate in our interview process and join the EsyGrab
                family!
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don't see a position that fits? Send us your resume anyway! We're
              always looking for talented individuals.
            </p>
            <a href="mailto:careers@esygrab.com">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Contact HR Team
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
