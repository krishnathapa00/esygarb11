import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import EsyLogo from "@/assets/logo/Esy.jpg";
import { useAuthContext } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const DeliveryPartnerAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signInWithPassword } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signup");

  //using this useeffect due to index.css body padding top but later we can maintain this
  useEffect(() => {
    document.body.classList.remove("with-search-bar");
    document.body.style.paddingTop = "0px";
    return () => {
      document.body.style.paddingTop = "";
    };
  }, []);

  // Form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    vehicleType: "",
    licenseNumber: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) navigate("/delivery-partner/dashboard");
  }, [user, navigate]);

  // SIGNUP HANDLER
  const handleSignUp = async () => {
    const { fullName, email, password, vehicleType, licenseNumber } =
      signupData;

    if (!fullName || !email || !password || !vehicleType || !licenseNumber) {
      return toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
    }

    if (password.length < 6) {
      return toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
    }

    setLoading(true);

    try {
      // Register user (email may require verification)
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "delivery_partner",
              full_name: fullName,
              vehicle_type: vehicleType,
              license_number: licenseNumber,
            },
          },
        });

      if (signUpError) throw signUpError;
      if (!signUpData?.user) throw new Error("Signup failed");

      const userId = signUpData.user.id;

      // Create profile ONLY if it doesn't exist
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingProfile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          full_name: fullName,
          email: email,
          role: "delivery_partner",
          vehicle_type: vehicleType,
          license_number: licenseNumber,
          delivery_location: "",
          is_online: false,
          kyc_verified: false,
        });

        if (insertError) throw insertError;
      }

      toast({
        title: "Account Created!",
        description:
          "Check your email for verification instructions. You can log in once verified.",
      });

      setActiveTab("login");
      setSignupData({
        fullName: "",
        email: "",
        password: "",
        vehicleType: "",
        licenseNumber: "",
      });
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🚀 LOGIN HANDLER
  const handleLogin = async () => {
    const { email, password } = loginData;

    if (!email || !password) {
      return toast({
        title: "Missing Information",
        description: "Please enter email and password",
        variant: "destructive",
      });
    }

    setLoading(true);

    try {
      const { data, error } = await signInWithPassword(email, password);

      if (error) {
        let msg = error.message;

        if (msg.includes("Email not confirmed")) {
          msg =
            "Please verify your email before logging in. Check your inbox or ask admin to disable confirmation.";
        }

        throw new Error(msg);
      }

      if (!data?.user) throw new Error("Login failed");

      // Check role via PROFILES TABLE
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Profile not found. Contact support.");
      }

      if (profile.role !== "delivery_partner") {
        throw new Error("Unauthorized. You are not a delivery partner.");
      }

      toast({
        title: "Welcome!",
        description: "You are now logged in as a delivery partner.",
      });

      navigate("/delivery-partner/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // COMPONENT UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="px-4 py-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src={EsyLogo}
              alt="EsyGrab Logo"
              className="h-16 mx-auto rounded-md"
            />
            <h1 className="text-2xl font-bold mt-2">Delivery Partner Portal</h1>
            <p className="text-gray-600">Join EsyGrab's delivery network</p>
          </div>

          <div className="bg-white rounded-xl shadow p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="signup">Join Us</TabsTrigger>
                <TabsTrigger value="login">Partner Login</TabsTrigger>
              </TabsList>

              {/* SIGNUP */}
              <TabsContent value="signup">
                <div className="space-y-4">
                  {[
                    ["Full Name", "fullName"],
                    ["Email Address", "email"],
                    ["Password", "password"],
                    ["Vehicle Type", "vehicleType"],
                    ["License Number", "licenseNumber"],
                  ].map(([label, field]) => (
                    <div key={field}>
                      <Label>{label}</Label>
                      <Input
                        type={field === "password" ? "password" : "text"}
                        value={signupData[field]}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            [field]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                    onClick={handleSignUp}
                  >
                    {loading ? "Creating Account..." : "Create Partner Account"}
                  </Button>
                </div>
              </TabsContent>

              {/* LOGIN */}
              <TabsContent value="login">
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                    onClick={handleLogin}
                  >
                    {loading ? "Logging in..." : "Login to Dashboard"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600">
                <a href="/auth/reset" className="text-green-600">
                  Forgot your password?
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerAuth;
