import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  History, 
  Package, 
  HelpCircle, 
  LogOut,
  ArrowLeft,
  ArrowRight,
  Phone,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from './Header';

const MobileUserProfile: React.FC = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 py-8 pt-20">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Sign in to your account</h2>
            <p className="text-muted-foreground">Access your orders, profile, and more</p>
            <Link to="/auth">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: History,
      label: "Order History",
      href: "/order-history",
      description: "View your past orders"
    },
    {
      icon: Package,
      label: "Track Orders",
      href: "/order-tracking-lookup",
      description: "Track your current orders"
    },
    {
      icon: HelpCircle,
      label: "Support",
      href: "/help-center",
      description: "Get help and support"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 py-8 pt-20 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">My Account</h1>
        </div>

        {/* User Info Card */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-foreground">
                  {user.email}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date().getFullYear()}
                </p>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="border-border hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{action.label}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Other Options */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground mb-3">Other</h3>
          
          <Link to="/contact-us">
            <Card className="border-border hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Contact Us</h4>
                      <p className="text-sm text-muted-foreground">Get in touch with our team</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/privacy-policy">
            <Card className="border-border hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Privacy Policy</h4>
                      <p className="text-sm text-muted-foreground">Learn about our privacy practices</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Sign Out */}
        <Card className="border-border">
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileUserProfile;
