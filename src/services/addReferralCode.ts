import { supabase } from "@/integrations/supabase/client";

const applyReferralCode = async (referralCode: string) => {
  const { data: user } = await supabase.auth.getUser();
  const refereeId = user.user.id;

  // Find referral code owner
  const { data: code } = await supabase
    .from("referral_codes")
    .select("id, user_id")
    .eq("code", referralCode)
    .single();

  // Create referral use
  await supabase.from("referral_uses").insert({
    referral_code_id: code.id,
    referee_user_id: refereeId,
    approved: true,
  });

  // 3. Fetch referrer wallet
  const { data: referrer } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", code.user_id)
    .single();

  // Fetch referee wallet
  const { data: referee } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", refereeId)
    .single();

  // Update both wallets
  await supabase
    .from("profiles")
    .update({ wallet_balance: referrer.wallet_balance + 10 })
    .eq("id", code.user_id);

  await supabase
    .from("profiles")
    .update({ wallet_balance: referee.wallet_balance + 10 })
    .eq("id", refereeId);
};

export default applyReferralCode;
