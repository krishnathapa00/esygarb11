import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SingleImageUpload } from "@/components/admin";
import { useToast } from "@/hooks/use-toast";

export const BANNER_GRADIENTS = [
  { label: "Purple → Pink", from: "from-purple-600", to: "to-pink-600" },
  { label: "Green → Emerald", from: "from-green-500", to: "to-emerald-600" },
  { label: "Blue → Cyan", from: "from-blue-500", to: "to-cyan-600" },
  { label: "Orange → Amber", from: "from-orange-500", to: "to-amber-600" },
  { label: "Red → Rose", from: "from-red-500", to: "to-rose-600" },
  { label: "Yellow → Orange", from: "from-yellow-400", to: "to-orange-500" },
];

interface AddBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBannerAdded: () => void;
  banner?: any | null;
}

const AddBannerModal = ({
  isOpen,
  onClose,
  onBannerAdded,
  banner,
}: AddBannerModalProps) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [gradient, setGradient] = useState(BANNER_GRADIENTS[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (banner) {
      setTitle(banner.title || "");
      setSubtitle(banner.subtitle || "");
      setImage(banner.image_url || "");
      setGradient(
        BANNER_GRADIENTS.find(
          (g) => g.from === banner.gradient_from && g.to === banner.gradient_to
        ) || BANNER_GRADIENTS[0]
      );
    } else {
      setTitle("");
      setSubtitle("");
      setImage("");
      setGradient(BANNER_GRADIENTS[0]);
    }
  }, [banner, isOpen]);

  const handleSaveBanner = async () => {
    if (!title)
      return toast({ title: "Title is required", variant: "destructive" });

    setLoading(true);

    const payload = {
      title,
      subtitle,
      image_url: image || null,
      gradient_from: gradient.from,
      gradient_to: gradient.to,
    };

    const { error } = banner
      ? await supabase.from("banners").update(payload).eq("id", banner.id)
      : await supabase
          .from("banners")
          .insert([{ ...payload, sort_order: 0, is_active: true }]);

    setLoading(false);

    if (error) {
      return toast({
        title: "Failed to save banner",
        description: error.message,
        variant: "destructive",
      });
    }

    onBannerAdded();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-2xl p-6 relative flex flex-col md:flex-row gap-6">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-muted-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Form Section */}
        <div className="flex-1 flex flex-col gap-6 p-6 bg-card rounded-2xl shadow-md">
          <h2 className="text-2xl font-extrabold text-gray-900">
            {banner ? "Edit Banner" : "Add New Banner"}
          </h2>

          {/* Title & Subtitle */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Banner Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Subtitle (optional)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="input input-bordered w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-700">Banner Image</p>
            <SingleImageUpload
              currentImage={image}
              folder="banners"
              onImageUpload={setImage}
            />
          </div>

          {/* Gradient Selection */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-700">
              Select Gradient
            </p>
            <div className="flex gap-3 flex-wrap">
              {BANNER_GRADIENTS.map((g) => (
                <button
                  key={g.label}
                  onClick={() => setGradient(g)}
                  title={g.label}
                  className={`
                    relative w-14 h-10 rounded-lg bg-gradient-to-r ${g.from} ${
                    g.to
                  }
                    transition-all duration-200
                    ${
                      gradient.label === g.label
                        ? "ring-4 ring-indigo-500 scale-105"
                        : "ring-2 ring-transparent hover:scale-105"
                    }
                  `}
                >
                  {gradient.label === g.label && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveBanner} disabled={loading}>
            {loading
              ? banner
                ? "Saving..."
                : "Adding..."
              : banner
              ? "Save Changes"
              : "Add Banner"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddBannerModal;
