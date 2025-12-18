import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ReferralLandingPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      localStorage.setItem("referral_code", code);
    }
    navigate("/auth");
  }, [code]);

  return null;
};

export default ReferralLandingPage;
