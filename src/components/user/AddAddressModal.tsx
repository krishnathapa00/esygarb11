import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: {
    type: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
  }) => void;
}

const initialState = {
  type: "",
  street: "",
  city: "",
  state: "",
  zip_code: "",
};

const AddAddressModal: React.FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave(form);
    setSaving(false);
    setForm(initialState);
  };

  React.useEffect(() => {
    if (!isOpen) setForm(initialState);
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="Home, Work, etc."
            />
          </div>
          <div>
            <Label htmlFor="street">Street</Label>
            <Input
              id="street"
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="State"
            />
          </div>
          <div>
            <Label htmlFor="zip_code">Pincode</Label>
            <Input
              id="zip_code"
              name="zip_code"
              value={form.zip_code}
              onChange={handleChange}
              placeholder="Pincode"
            />
          </div>
          <DialogFooter className="flex justify-end pt-2 gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAddressModal;
