import { useState, useEffect } from "react";
import { X, Gift, Copy, Share2, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReferralPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
  userId?: string;
}

const ReferralPopup = ({
  isOpen,
  onClose,
  isLoggedIn,
  onLoginRequired,
  userId,
}: ReferralPopupProps) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

  const getReferralCode = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching referral code:", error.message);
      return;
    }

    if (data?.code) {
      setReferralCode(data.code);
    } else {
      const newCode =
        "ESY" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error: insertError } = await supabase
        .from("referral_codes")
        .insert({ user_id: userId, code: newCode });

      if (insertError) {
        console.error("Error inserting referral code:", insertError.message);
        return;
      }

      setReferralCode(newCode);
    }
  };

  useEffect(() => {
    if (isLoggedIn && showCode) {
      getReferralCode();
    }
  }, [isLoggedIn, showCode]);

  const referralLink = referralCode
    ? `https://esygrab.com/ref/${referralCode}`
    : "";

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "Referral code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleShare = async () => {
    if (!referralCode) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Get Free Delivery on EsyGrab!",
          text: `Use my referral code ${referralCode} to get free delivery!`,
          url: referralLink,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const applyReferralCode = async (enteredCode: string) => {
    if (!userId) return;

    const { data: codeData, error } = await supabase
      .from("referral_codes")
      .select("user_id")
      .eq("code", enteredCode)
      .single();

    if (error) {
      console.error(error);
      toast({ title: "Invalid referral code" });
      return;
    }

    if (codeData.user_id === userId) {
      toast({ title: "You cannot use your own referral code" });
      return;
    }

    const { data: usedData } = await supabase
      .from("referral_uses")
      .select("*")
      .eq("referral_code", enteredCode)
      .eq("used_by", userId)
      .single();

    if (usedData) {
      toast({ title: "You have already used this referral code" });
      return;
    }

    const { error: insertError } = await supabase.from("referral_uses").insert({
      referral_code: enteredCode,
      used_by: userId,
    });

    if (insertError) {
      console.error(insertError);
      toast({ title: "Failed to apply referral code" });
      return;
    }

    toast({ title: "Referral code applied successfully!" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-card p-0 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-foreground/20 rounded-full">
                <Gift className="w-6 h-6 " />
              </div>
              <DialogTitle className="text-xl font-bold">
                Refer & Earn
              </DialogTitle>
            </div>
            <p className="text-primary-foreground/90 text-sm">
              Share with friends and both get free delivery!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!isLoggedIn ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">
                Login to get your code
              </h3>
              <p className="text-muted-foreground text-sm">
                Sign in to generate your unique referral code
              </p>
              <Button
                onClick={onLoginRequired}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Login to Continue
              </Button>
            </div>
          ) : !showCode ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-sm">
                Click below to generate your referral code
              </p>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setShowCode(true)}
              >
                Get My Referral Code
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  How it works
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>1. Share your unique code with friends</li>
                  <li>2. They apply it at checkout</li>
                  <li>3. You both get free delivery!</li>
                </ul>
              </div>

              {referralCode && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Your Referral Code
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-lg font-bold text-foreground tracking-wider text-center border-2 border-dashed border-primary/30">
                        {referralCode}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyCode}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-success" />
                        ) : (
                          <Copy className="w-5 h-5 text-primary" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Or share via link
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm text-muted-foreground truncate">
                        {referralLink}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyLink}
                      >
                        <Copy className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleShare}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    <Share2 className="w-4 h-4" /> Share with Friends
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Code valid for 1 week • One-time use per user
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralPopup;
