import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export type PetEdit = {
  id: number;
  name: string;
  username: string;
  type: "Dog" | "Cat" | "Bird" | "Rabbit" | "Other" | string;
  breed?: string | null;
  age?: string | null;
  color?: string | null;
  description?: string | null;
  photo_url?: string | null;
  show_phone?: boolean;
  show_whatsapp?: boolean;
  show_instagram?: boolean;
  show_address?: boolean;
  is_active: boolean;
};

export type PetEditDialogProps = {
  open: boolean;
  pet?: PetEdit | null;
  uploading?: boolean;
  onClose: () => void;
  onUploadPhoto: (file: File) => void | Promise<void>;
  onChange: (updates: Partial<PetEdit>) => void;
  onSave: () => void | Promise<void>;
};

const PetEditDialog: React.FC<PetEditDialogProps> = ({
  open,
  pet,
  uploading,
  onClose,
  onUploadPhoto,
  onChange,
  onSave,
}) => {
  if (!pet) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold">Edit Pet Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update pet information and privacy settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
            <div>
              <Label htmlFor="photo-upload">Pet Photo</Label>
              <div className="mt-2 flex items-start gap-3">
                <div className="w-28 h-28 rounded-lg overflow-hidden ring-1 ring-border bg-muted/30 shrink-0">
                  {pet.photo_url ? (
                    <img
                      src={pet.photo_url}
                      alt={pet.name || "Pet"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">
                      No photo
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="photo-upload">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUploadPhoto(file);
                      }}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" className="w-fit" disabled={uploading}>
                      {uploading ? "Uploading…" : "Upload Photo"}
                    </Button>
                  </label>
              
                </div>
              </div>
            </div>

            {/* Name / Username */}
            <div className="grid grid-cols-1 gap-4 content-start">
              <div>
                <Label htmlFor="petName">Pet Name</Label>
                <Input
                  id="petName"
                  value={pet.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="e.g., Bruno"
                />
              </div>
              <div>
                <Label htmlFor="petUsername">Username</Label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 h-10 rounded-l-md ring-1 ring-border bg-muted/40 text-sm text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="petUsername"
                    value={pet.username}
                    onChange={(e) => onChange({ username: e.target.value })}
                    className="rounded-l-none"
                    placeholder="bruno_the_pup"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Shown on the public pet profile URL.
                </p>
              </div>
            </div>
          </div>

          {/* Basic attributes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="petType">Type</Label>
              {/* native select kept for simplicity; replace with shadcn Select if you prefer */}
              <select
                id="petType"
                value={pet.type}
                onChange={(e) => onChange({ type: e.target.value })}
                className="flex h-10 w-full rounded-md ring-1 ring-border bg-background px-3 py-2 text-sm"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="petBreed">Breed</Label>
              <Input
                id="petBreed"
                value={pet.breed || ""}
                onChange={(e) => onChange({ breed: e.target.value })}
                placeholder="e.g., Labrador"
              />
            </div>
            <div>
              <Label htmlFor="petAge">Age</Label>
              <Input
                id="petAge"
                value={pet.age || ""}
                onChange={(e) => onChange({ age: e.target.value })}
                placeholder="e.g., 3 years"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div>
              <Label htmlFor="petDescription">Description</Label>
              <Textarea
                id="petDescription"
                rows={3}
                value={pet.description || ""}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Add any notes, temperament, vaccination info, etc."
              />
            </div>
            <div>
              <Label htmlFor="petColor">Color</Label>
              <Input
                id="petColor"
                value={pet.color || ""}
                onChange={(e) => onChange({ color: e.target.value })}
                placeholder="e.g., Brown & white"
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="rounded-lg ring-1 ring-border p-3">
            <Label className="text-sm font-medium">Privacy Settings</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Choose which owner contact details appear on the pet’s public profile.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                <div>
                  <Label htmlFor="showPhone" className="font-normal">Show Phone</Label>
                </div>
                <Switch
                  id="showPhone"
                  checked={!!pet.show_phone}
                  onCheckedChange={(v) => onChange({ show_phone: !!v })}
                />
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                <div>
                  <Label htmlFor="showWhatsApp" className="font-normal">Show WhatsApp</Label>
                </div>
                <Switch
                  id="showWhatsApp"
                  checked={!!pet.show_whatsapp}
                  onCheckedChange={(v) => onChange({ show_whatsapp: !!v })}
                />
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                <div>
                  <Label htmlFor="showInstagram" className="font-normal">Show Instagram</Label>
                </div>
                <Switch
                  id="showInstagram"
                  checked={!!pet.show_instagram}
                  onCheckedChange={(v) => onChange({ show_instagram: !!v })}
                />
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                <div>
                  <Label htmlFor="showAddress" className="font-normal">Show Address</Label>
                </div>
                <Switch
                  id="showAddress"
                  checked={!!pet.show_address}
                  onCheckedChange={(v) => onChange({ show_address: !!v })}
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSave} aria-label="Save pet changes">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PetEditDialog;
