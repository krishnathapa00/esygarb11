import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gift,
  Copy,
  Share2,
  Check,
  ArrowLeft,
  Users,
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
        .in(
          "referral_code_id",
          (
            await supabase
              .from("referral_codes")
              .select("id")
              .eq("user_id", userId)
          ).data.map((code) => code.id)
        );

      const totalReferrals = data?.length || 0;

      const approvedReferrals = data?.filter((r) => r.approved).length || 0;

      setReferralsCount(totalReferrals);
      setEarnedRewards(approvedReferrals);
      setPendingRewards(totalReferrals - approvedReferrals);
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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Loading referral details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium hover:text-secondary transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-foreground/20 rounded-full">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Refer & Earn</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Share the love, earn rewards!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard
            icon={<Users className="text-white" />}
            label="Friends Referred"
            value={referralsCount}
            color="bg-primary"
          />
          <StatCard
            icon={<Gift className="text-white" />}
            label="Rewards Earned"
            value={`Rs ${earnedRewards * 10}`}
            color="bg-green-500"
          />
          <StatCard
            icon={<Clock className="text-white" />}
            label="Pending Rewards"
            value={pendingRewards}
            color="bg-yellow-500"
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

// ----------------------
// Components
// ----------------------
const StatCard = ({ icon, label, value, color }) => (
  <Card className={`shadow-lg rounded-xl border-0 overflow-hidden`}>
    <CardContent className="flex items-center gap-4 p-6">
      <div
        className={`p-4 rounded-lg ${color} flex items-center justify-center`}
      >
        {icon}
      </div>
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
  <Card className="shadow-2xl rounded-xl border-0 overflow-hidden">
    <CardContent className="p-6 space-y-6">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Star className="w-5 h-5 text-primary" />
        Your Referral Code
      </h2>

      {/* Code */}
      <div>
        <label className="text-sm text-muted-foreground">Referral Code</label>
        <div className="flex gap-3 mt-2 flex-col sm:flex-row">
          <div className="flex-1 bg-muted p-4 rounded-lg font-mono text-2xl text-center border-2 border-dashed border-primary/30">
            {referralCode}
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleCopyCode}
          >
            {copied ? <Check /> : <Copy />} Copy Code
          </Button>
        </div>
      </div>

      {/* Link */}
      <div>
        <label className="text-sm text-muted-foreground">Referral Link</label>
        <div className="flex gap-3 mt-2 flex-col sm:flex-row">
          <div className="flex-1 bg-muted p-3 rounded-lg text-sm truncate">
            {referralLink}
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleCopyLink}
          >
            {linkCopied ? <Check /> : <Copy />} Copy Link
          </Button>
        </div>
      </div>

      {/* Share */}
      <Button
        className="w-full py-4 text-lg bg-gradient-to-r from-primary to-accent text-white font-semibold hover:from-accent hover:to-primary transition-all shadow-lg"
        onClick={handleShare}
      >
        <Share2 className="w-5 h-5 inline-block mr-2" />
        Share with Friends
      </Button>
    </CardContent>
  </Card>
);
