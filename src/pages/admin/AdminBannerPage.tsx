import { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import AddBannerModal from "./components/AddBannerModal";
import { useToast } from "@/hooks/use-toast";

const AdminBannerPage = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<any | null>(null);

  const { toast } = useToast();

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });

    setBanners(data || []);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Delete
  const deleteBanner = (id: number) => {
    toast({
      title: "Delete banner?",
      description: "This action cannot be undone.",
      variant: "destructive",
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              const { error } = await supabase
                .from("banners")
                .delete()
                .eq("id", id);

              if (error) {
                return toast({
                  title: "Failed to delete banner",
                  description: error.message,
                  variant: "destructive",
                });
              }

              toast({ title: "Banner deleted" });
              fetchBanners();
            }}
          >
            Yes
          </Button>

          <Button size="sm" variant="outline">
            No
          </Button>
        </div>
      ),
    });
  };

  // Active / Deactivate
  const toggleActive = async (banner: any) => {
    await supabase
      .from("banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);

    fetchBanners();
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Banner Control</h1>
          <Button
            onClick={() => {
              setEditingBanner(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </div>

        <AddBannerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onBannerAdded={fetchBanners}
          banner={editingBanner}
        />

        <div className="space-y-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-card border rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`relative h-16 w-32 rounded-lg overflow-hidden bg-gradient-to-r ${b.gradient_from} ${b.gradient_to}`}
                >
                  {b.image_url && (
                    <img
                      src={b.image_url}
                      alt={b.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.subtitle}</p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                {/* Edit */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingBanner(b);
                    setModalOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                {/* Active Toggle */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleActive(b)}
                >
                  {b.is_active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Delete */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setBannerToDelete(b);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {deleteModalOpen && bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Delete Banner
            </h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{bannerToDelete.title}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="transition-all hover:bg-gray-100"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setBannerToDelete(null);
                }}
              >
                No
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="transition-all hover:scale-105"
                onClick={async () => {
                  const { error } = await supabase
                    .from("banners")
                    .delete()
                    .eq("id", bannerToDelete.id);

                  if (error) {
                    console.error(error);
                    // optionally show toast or in-modal error message
                  } else {
                    fetchBanners();
                  }

                  setDeleteModalOpen(false);
                  setBannerToDelete(null);
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBannerPage;
