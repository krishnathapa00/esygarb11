import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gift,
  Copy,
  Share2,
  Check,
  ArrowLeft,
  Users,
  Truck,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ReferralPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userId, setUserId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralsCount, setReferralsCount] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState(0);

  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    document.body.style.paddingTop = "0px";
    return () => {
      document.body.style.paddingTop = "";
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/auth?redirect=/referral");
        return;
      }
      setUserId(data.user.id);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchCode = async () => {
      const { data } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", userId)
        .single();

      if (data?.code) {
        setReferralCode(data.code);
      } else {
        const newCode =
          "ESY" + Math.random().toString(36).substring(2, 8).toUpperCase();

        await supabase.from("referral_codes").insert({
          user_id: userId,
          code: newCode,
        });

        setReferralCode(newCode);
      }
    };

    fetchCode();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      const { data } = await supabase
        .from("referral_uses")
        .select("*")
        .eq("referrer", userId);

      setReferralsCount(data?.length || 0);

      setEarnedRewards(data?.filter((x) => x.status === "earned").length || 0);
      setPendingRewards(
        data?.filter((x) => x.status === "pending").length || 0
      );
    };

    fetchStats();
  }, [userId]);

  const referralLink = referralCode
    ? `https://esygrab.com/ref/${referralCode}`
    : "";

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: "Code copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralCode) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Get Rs.10 on EsyGrab!",
          text: `Use my referral code ${referralCode}!`,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!referralCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading referral details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-foreground/20 rounded-full">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Refer & Earn</h1>
              <p className="">Share the love, earn rewards!</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-0 pb-8 space-y-10">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Users />}
            label="Friends Referred"
            value={referralsCount}
          />
          <StatCard
            icon={<Truck />}
            label="Rewards Earned"
            value={earnedRewards}
          />
          <StatCard
            icon={<Clock />}
            label="Pending Rewards"
            value={pendingRewards}
          />
        </div>

        {/* Referral Code Card */}
        <ReferralCodeCard
          referralCode={referralCode}
          referralLink={referralLink}
          copied={copied}
          linkCopied={linkCopied}
          handleCopyCode={handleCopyCode}
          handleCopyLink={handleCopyLink}
          handleShare={handleShare}
        />
      </main>
    </div>
  );
};

export default ReferralPage;

const StatCard = ({ icon, label, value }) => (
  <Card className="border-0 shadow-md bg-card">
    <CardContent className="p-5 flex items-center gap-4">
      <div className="p-3 bg-accent rounded-full">{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const ReferralCodeCard = ({
  referralCode,
  referralLink,
  copied,
  linkCopied,
  handleCopyCode,
  handleCopyLink,
  handleShare,
}) => (
  <Card className="shadow-lg bg-card">
    <CardContent className="p-6 space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Star className="w-5 h-5 text-primary" />
        Your Referral Code
      </h2>

      {/* Code */}
      <div>
        <label className="text-sm text-muted-foreground">Referral Code</label>
        <div className="flex gap-3 mt-2">
          <div className="flex-1 bg-muted p-4 rounded-lg font-mono text-2xl text-center border-2 border-dashed border-primary/30">
            {referralCode}
          </div>
          <Button variant="outline" onClick={handleCopyCode}>
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>

      {/* Link */}
      <div>
        <label className="text-sm text-muted-foreground">Referral Link</label>
        <div className="flex gap-3 mt-2">
          <div className="flex-1 bg-muted p-3 rounded-lg text-sm truncate">
            {referralLink}
          </div>
          <Button variant="outline" onClick={handleCopyLink}>
            {linkCopied ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>

      {/* Share Button */}
      <Button className="w-full py-6 text-lg" onClick={handleShare}>
        <Share2 className="w-5 h-5" /> Share with Friends
      </Button>
    </CardContent>
  </Card>
);
