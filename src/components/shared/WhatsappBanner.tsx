import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const WHATSAPP_GROUP_LINK =
  "https://chat.whatsapp.com/I0XSrDE7HbcIEQHE8ouBJB?mode=ems_copy_t";

const WhatsappBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("hideWhatsappBanner");
    if (!dismissed) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
    localStorage.setItem("hideWhatsappBanner", "true");
  };

  if (!isVisible || isClosed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs w-full">
      <div className="bg-green-100 border border-green-300 rounded-lg shadow-lg p-2 flex items-center justify-between animate-slide-in">
        <div className="flex items-center space-x-3">
          <span className="text-xl">💬</span>
          <span className="text-sm sm:text-base font-medium text-green-900 max-w-[180px]">
            Join our <strong>WhatsApp group</strong> for exclusive offers!
          </span>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <a
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Join Now
            </Button>
          </a>
          <button
            onClick={handleClose}
            className="text-green-800 hover:text-red-600"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsappBanner;
