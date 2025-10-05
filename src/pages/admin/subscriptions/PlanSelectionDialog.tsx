import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionPlan } from "@/lib/subscriptionPlans";

export type PlanSelectionDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  userInfo?: { name?: string; email?: string };
  plans: SubscriptionPlan[]; // presentational only
  onSelect: (plan: SubscriptionPlan) => void;
  onClose: () => void;
};

// ---- Utils ----
const formatCurrency = (n: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n || 0);

const monthLabel = (m?: number) => `${m ?? 0} ${m === 1 ? "month" : "months"}`;

const PlanCard: React.FC<{
  plan: SubscriptionPlan;
  onSelect: (p: SubscriptionPlan) => void;
}> = ({ plan, onSelect }) => {
  const duration = plan.duration_months ?? 0;
  const isAnnual = duration >= 12;
  const isInactive = (plan as any).is_active === false; // optional if field exists
  const perMonth =
    duration > 0 ? Math.round((plan.amount || 0) / duration) : plan.amount || 0;

  return (
    <Card
      className={[
        "bg-card ring-1 ring-border rounded-xl transition-colors",
        isInactive ? "opacity-60 pointer-events-none" : "hover:bg-muted/40",
      ].join(" ")}
      aria-disabled={isInactive}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="truncate">{plan.name}</span>
          <span className="inline-flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {isAnnual ? "Annual" : monthLabel(duration)}
            </Badge>
            {isAnnual && (
              <Badge className="bg-green-600 text-white">Best value</Badge>
            )}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="leading-tight">
          <div className="text-2xl font-semibold">
            {formatCurrency(plan.amount || 0)}
          </div>
          <div className="text-xs text-muted-foreground">
            ~ {formatCurrency(perMonth)} / month
          </div>
        </div>

        {!!plan.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {plan.description}
          </p>
        )}

        <Button
          className="w-full"
          onClick={() => onSelect(plan)}
          aria-label={`Select plan ${plan.name}`}
          disabled={isInactive}
        
        >
          Select Plan
        </Button>
      </CardContent>
    </Card>
  );
};

const PlanSelectionDialog: React.FC<PlanSelectionDialogProps> = ({
  open,
  title = "Select Plan",
  description,
  userInfo,
  plans,
  onSelect,
  onClose,
}) => {
  // Prefer showing active plans first if `is_active` exists
  const sortedPlans = React.useMemo(() => {
    const withActive = plans.map((p) => ({
      p,
      active: (p as any).is_active !== false,
    }));
    withActive.sort((a, b) => Number(b.active) - Number(a.active));
    return withActive.map(({ p }) => p);
  }, [plans]);

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
          {userInfo && (userInfo.name || userInfo.email) && (
            <p className="text-xs text-muted-foreground mt-1">
              For:{" "}
              <span className="font-medium">{userInfo.name || "—"}</span>
              {userInfo.email ? ` • ${userInfo.email}` : ""}
            </p>
          )}
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4">
          {sortedPlans && sortedPlans.length > 0 ? (
            sortedPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={onSelect} />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="bg-card ring-1 ring-border rounded-xl">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No plans available.
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectionDialog;
