import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { MoreVertical, Plus, Save, Trash2, Edit3, Loader2, Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { subscriptionPlansService, type SubscriptionPlan } from "@/lib/subscriptionPlans";

export type SubscriptionPlansManagementProps = {
  onPlansUpdate?: () => void;
};

// ---------- Utils ----------
const formatCurrency = (n: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);

const pluralMonths = (m?: number) => `${m ?? 0} ${m === 1 ? "month" : "months"}`;

const emptyPlan: Partial<SubscriptionPlan> = {
  name: "",
  amount: 0,
  duration_months: 1,
  description: "",
  is_active: true as any,
};

const SubscriptionPlansManagement: React.FC<SubscriptionPlansManagementProps> = ({ onPlansUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [query, setQuery] = useState("");

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<Partial<SubscriptionPlan>>(emptyPlan);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return plans;
    return plans.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        String(p.duration_months || "").includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [plans, query]);

  const load = async () => {
    try {
      setLoading(true);
      const list = (await subscriptionPlansService.getAllPlans?.()) || [];
      setPlans(list as SubscriptionPlan[]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlan);
    setOpen(true);
  };

  const openEdit = (p: SubscriptionPlan) => {
    setEditing(p);
    setForm({ ...p });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.duration_months || form.amount == null) {
      return toast.error("Name, amount, and duration are required");
    }
    if ((form.duration_months as number) <= 0) {
      return toast.error("Duration must be at least 1 month");
    }
    if ((form.amount as number) < 0) {
      return toast.error("Amount cannot be negative");
    }
    try {
      setSubmitting(true);
      if (editing) {
        const updated = await subscriptionPlansService.updatePlan?.(editing.id as any, {
          name: form.name,
          amount: form.amount,
          duration_months: form.duration_months,
          description: form.description,
          is_active: form.is_active,
        });
        setPlans((prev) => prev.map((p) => (p.id === editing.id ? { ...(p as any), ...(updated as any) } : p)));
        toast.success("Plan updated");
      } else {
        const created = await subscriptionPlansService.createPlan?.({
          name: form.name,
          amount: form.amount,
          duration_months: form.duration_months,
          description: form.description,
          is_active: form.is_active ?? true,
        } as any);
        if (created) setPlans((prev) => [created as SubscriptionPlan, ...prev]);
        toast.success("Plan created");
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyPlan);
      onPlansUpdate?.();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (!confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await subscriptionPlansService.deletePlan?.(plan.id as any);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      toast.success("Plan deleted");
      onPlansUpdate?.();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete plan");
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const next = !plan.is_active;
      const updated = await subscriptionPlansService.updatePlan?.(plan.id as any, { is_active: next } as any);
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...(p as any), ...(updated as any) } : p)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  // ----- UI -----
  return (
    <Card className="bg-card ring-1 ring-border rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-[15px] font-semibold">Subscription Plans</CardTitle>
          <CardDescription className="text-muted-foreground">Create, edit, or remove plans</CardDescription>
        </div>
        <div className="flex gap-4">
           <div className="relative max-w-sm">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by name, months, or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
            aria-label="Search plans"
          />
      
        </div>
        <Button onClick={openCreate} aria-label="Create new plan">
          <Plus className="w-4 h-4 mr-2" /> New Plan
        </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Search */}
     

        {/* Table / Loading / Empty */}
        {loading ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading plans...
          </div>
        ) : (
          <div className="bg-background overflow-hidden rounded-md border">
            <Table className="min-w-[860px] [&_th]:h-9 [&_th]:py-2 [&_td]:py-2">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{pluralMonths(p.duration_months)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.amount as number)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.is_active ? "default" : "destructive"}
                        className={p.is_active ? "bg-green-600 text-white" : ""}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[360px] truncate" title={p.description || ""}>
                      {p.description}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Plan actions">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(p)}
                            aria-label={p.is_active ? "Deactivate plan" : "Activate plan"}
                            className={p.is_active ? "text-red-600 focus:text-red-700" : "text-green-600 focus:text-green-700"}
                          >
                            {p.is_active ? (
                              <span className="flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                              
                                <span>Set Inactive</span>
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                              
                                <span>Set Active</span>
                              </span>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Edit3 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground text-center py-8">
                      No plans found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create / Edit Dialog */}
        <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Plan" : "New Plan"}</DialogTitle>
              <DialogDescription>Define plan details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    value={form.name || ""}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="eg. Starter, Pro, Annual"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan-duration">Duration (months)</Label>
                    <Input
                      id="plan-duration"
                      type="number"
                      min={1}
                      value={form.duration_months || 1}
                      onChange={(e) => setForm((f) => ({ ...f, duration_months: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-amount">Amount (₹)</Label>
                    <Input
                      id="plan-amount"
                      type="number"
                      min={0}
                      value={form.amount ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="plan-desc">Description</Label>
                  <Textarea
                    id="plan-desc"
                    rows={3}
                    value={form.description || ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What does this plan include?"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg ring-1 ring-border p-3">
                  <div>
                    <Label className="font-medium">Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Toggle to enable/disable this plan for new purchases
                    </p>
                  </div>
                  <Switch
                    checked={!!form.is_active}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v as any }))}
                    aria-label="Toggle plan active"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlansManagement;
