// components/modals/UserDetailsModal.tsx

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, BadgeInfo, X } from "lucide-react";

interface UserDetailsModalProps {
  user: {
    id: string;
    full_name: string;
    phone_number?: string;
    phone?: string;
    address?: string;
    role: string;
    created_at: string;
  } | null;
  onClose: () => void;
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
    case "super_admin":
      return "destructive";
    case "delivery_partner":
    case "customer":
    default:
      return "outline";
  }
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
}) => {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">User ID</span>
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {user.id}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Full Name</span>
            <span className="font-medium text-lg">
              {user.full_name || "N/A"}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Phone Number</span>
            <span className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              {user.phone || user.phone_number || "N/A"}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Address</span>
            <span className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5" />
              {user.address || "No address provided"}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge
              variant={getRoleBadgeColor(user.role)}
              className="w-fit capitalize"
            >
              {user.role.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Joined</span>
            <span className="text-sm">
              {new Date(user.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
