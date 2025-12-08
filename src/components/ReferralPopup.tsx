import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ReferralPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

const ReferralPopup = ({ isOpen, onClose, isLoggedIn }: ReferralPopupProps) => {
  const handleClick = () => {
    if (isLoggedIn) {
      window.location.href = "/referral";
    } else {
      window.location.href = "/auth?redirect=/referral";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-card p-0 overflow-hidden rounded-xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground relative">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6" />
            Share with Friends & Earn!
          </DialogTitle>
          <p className="text-primary-foreground/90 text-sm mt-2">
            Earn Rs.10 for every friend who joins using your referral link.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
            onClick={handleClick}
          >
            Get My Referral Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralPopup;
