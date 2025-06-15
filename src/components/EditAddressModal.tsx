
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Address {
  id: number;
  type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  default: boolean;
}

interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Address) => void;
  address: Address | null;
}

const EditAddressModal: React.FC<EditAddressModalProps> = ({ isOpen, onClose, onSave, address }) => {
  const [form, setForm] = useState<Address | null>(address);

  useEffect(() => {
    setForm(address);
  }, [address]);

  if (!form) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => { e.preventDefault(); onSave(form); }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={form.pincode}
              onChange={e => setForm({ ...form, pincode: e.target.value })}
            />
          </div>
          <DialogFooter className="flex justify-end pt-2 gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAddressModal;
