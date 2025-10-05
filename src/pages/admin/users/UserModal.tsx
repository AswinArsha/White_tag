import React, { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, Trash2 } from "lucide-react";
import type { User, Pet } from "@/lib/supabase";

export type UserModalMode = "edit" | "delete" | "subscription" | "pets";

export type UserModalProps = {
  open: boolean;
  mode: UserModalMode;
  user?: User | null;
  subscriptions?: Array<{
    id: number;
    plan_type: string;
    status: string;
    start_date: string;
    end_date: string;
    amount: number;
  }>;
  pets?: Pet[];
  onClose: () => void;
  onSaveUser?: (updates: Partial<User> & { password?: string }) => Promise<void> | void;
  onDeactivateUser?: () => Promise<void> | void;
};

// ---- Utils (locale, money, dates) ----
const formatCurrency = (n: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);

const formatDate = (iso?: string | Date) =>
  iso ? new Date(iso).toLocaleDateString() : "—";

const UserModal: React.FC<UserModalProps> = ({
  open,
  mode,
  user,
  subscriptions = [],
  pets = [],
  onClose,
  onSaveUser,
  onDeactivateUser,
}) => {
  const [localUser, setLocalUser] = useState<User | undefined | null>(user);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  React.useEffect(() => {
    setLocalUser(user);
    setPassword("");
    setConfirm("");
  }, [user, mode, open]);

  // ----------------- EDIT VIEW -----------------
  if (mode === "edit" && localUser) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Edit User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update user profile details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="u-name">Name</Label>
              <Input
                id="u-name"
                value={localUser.name || ""}
                onChange={(e) => setLocalUser({ ...(localUser as User), name: e.target.value })}
                placeholder="Full name"
              />
            </div>

            <div>
              <Label htmlFor="u-email">Email</Label>
              <Input
                id="u-email"
                value={localUser.email || ""}
                onChange={(e) => setLocalUser({ ...(localUser as User), email: e.target.value })}
                placeholder="name@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="u-phone">Phone</Label>
                <Input
                  id="u-phone"
                  value={localUser.phone || ""}
                  onChange={(e) => setLocalUser({ ...(localUser as User), phone: e.target.value })}
                  placeholder="+91 ..."
                />
              </div>
              <div>
                <Label htmlFor="u-whatsapp">WhatsApp</Label>
                <Input
                  id="u-whatsapp"
                  value={localUser.whatsapp || ""}
                  onChange={(e) => setLocalUser({ ...(localUser as User), whatsapp: e.target.value })}
                  placeholder="+91 ..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="u-instagram">Instagram</Label>
                <Input
                  id="u-instagram"
                  value={localUser.instagram || ""}
                  onChange={(e) => setLocalUser({ ...(localUser as User), instagram: e.target.value })}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label htmlFor="u-address">Address</Label>
                <Input
                  id="u-address"
                  value={localUser.address || ""}
                  onChange={(e) => setLocalUser({ ...(localUser as User), address: e.target.value })}
                  placeholder="Street, City, State"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="u-pass">New Password</Label>
                <Input
                  id="u-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
              <div>
                <Label htmlFor="u-pass2">Confirm Password</Label>
                <Input
                  id="u-pass2"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!onSaveUser || !localUser) return;
                  if (password && password.length < 8) {
                    alert("Password must be at least 8 characters");
                    return;
                  }
                  if (password && password !== confirm) {
                    alert("Passwords do not match");
                    return;
                  }
                  await onSaveUser({
                    id: localUser.id,
                    name: localUser.name || undefined,
                    email: localUser.email || undefined,
                    phone: localUser.phone || undefined,
                    whatsapp: localUser.whatsapp || undefined,
                    instagram: localUser.instagram || undefined,
                    address: localUser.address || undefined,
                    password: password || undefined,
                  });
                  onClose();
                }}
                aria-label="Save user"
              >
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ----------------- DEACTIVATE VIEW -----------------
  if (mode === "delete" && user) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Deactivate User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will deactivate the user account.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to deactivate <span className="font-medium text-foreground">{user.name || "this user"}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (onDeactivateUser) await onDeactivateUser();
                  onClose();
                }}
                aria-label="Confirm deactivation"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Deactivate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ----------------- SUBSCRIPTIONS VIEW -----------------
  if (mode === "subscription" && user) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Subscription Plan</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Subscriptions taken by {user.name || "user"}.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <div className="overflow-auto rounded-lg ring-1 ring-border">
              <Table className="min-w-[700px]">
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-b">
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(subscriptions || []).map((s) => (
                    <TableRow key={s.id} className="odd:bg-muted/20 hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{s.plan_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={s.status === "active" ? "default" : "destructive"}
                          className={s.status === "active" ? "bg-green-600 text-white" : ""}
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(s.start_date)}</TableCell>
                      <TableCell>{formatDate(s.end_date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {(!subscriptions || subscriptions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-sm text-muted-foreground text-center py-8">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ----------------- PETS VIEW -----------------
  if (mode === "pets" && user) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Pet Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Pets owned by {user.name || "user"}.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <div className="overflow-auto rounded-lg ring-1 ring-border">
              <Table className="min-w-[680px]">
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-b">
                    <TableHead>Pet</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(pets || []).map((p) => (
                    <TableRow key={p.id} className="odd:bg-muted/20 hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          {p.photo_url && (
                            <img
                              src={p.photo_url}
                              alt={`${p.name || "Pet"} photo`}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[220px]">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[220px]">@{p.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{p.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={p.is_active ? "default" : "destructive"}
                          className={p.is_active ? "bg-green-600 text-white" : ""}
                        >
                          {p.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(p.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {(!pets || pets.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-sm text-muted-foreground text-center py-8">
                        No pets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ----------------- FALLBACK -----------------
  return null;
};

export default UserModal;
