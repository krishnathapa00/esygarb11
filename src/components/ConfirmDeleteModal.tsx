
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  itemName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  itemName
}) => (
  <Dialog open={isOpen} onOpenChange={open => { if (!open) onCancel(); }}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Address</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        Are you sure you want to delete <span className="font-semibold">{itemName}</span>? This action cannot be undone.
      </div>
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmDeleteModal;
