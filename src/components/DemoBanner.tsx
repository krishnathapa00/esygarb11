import React from "react";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DemoBanner = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-black py-2 px-4 text-center relative z-50">
      <div className="flex items-center justify-center gap-2 font-bold text-sm">
        <AlertTriangle className="h-4 w-4" />
        <span>⚠️ This is a demo version. Some products and features may not be real. Launching soon!</span>
      </div>
    </div>
  );
};

export default DemoBanner;