import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, DollarSign, PawPrint, Eye, Heart, ArrowRight } from "lucide-react";

export type HomeOverviewProps = {
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    totalPets: number;
    totalScans: number;
    activePets: number;
  };
  expiringSubs: Array<{
    id: number;
    plan_type: string;
    end_date: string; // ISO date
    amount: number;
    users?: { name?: string; email?: string; phone?: string };
  }>;
  pendingUsers: Array<{ id: number; name?: string; email?: string; phone?: string }>;
  recentUsers: Array<{ id: number; name?: string; email?: string; status?: "Active" | "Pending"; pets: number }>;
  onOpenSubscriptionsExpiry: () => void;
  onOpenUsersPending: () => void;
  onOpenUsersRecent: () => void;
  onClickRenew: (subscriptionId: number) => void;
  onClickApprove: (userId: number) => void;
  onClickReject: (userId: number) => void;
};

const msPerDay = 1000 * 60 * 60 * 24;
const daysLeft = (isoDate: string) => Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / msPerDay));

// Locale-aware formatters (India)
const formatNumber = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const formatCurrency = (n: number, currency: string = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

// Short number (K/L/Cr)
const formatShort = (n: number) => {
  if (n >= 1_00_00_000) return (n / 1_00_00_000).toFixed(1) + "Cr";
  if (n >= 1_00_000) return (n / 1_00_000).toFixed(1) + "L";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return `${n}`;
};

// Urgency colors for expiry chips
const urgencyColor = (d: number) =>
  d <= 3 ? "bg-red-500" : d <= 7 ? "bg-amber-500" : "bg-muted-foreground";

// Tiny progress bar (neutral, shadow-free)
const ProgressBar: React.FC<{ value: number; label?: string }> = ({ value }) => (
  <div className="h-1.5 w-28 rounded-full bg-muted/40 overflow-hidden">
    <div
      className="h-full rounded-full bg-foreground/70"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
}> = ({ title, value, hint, icon }) => (
  <Card className="bg-card ring-1 ring-border rounded-xl">
    <CardHeader className="pb-1 flex flex-row items-center justify-between">
      <CardTitle className="text-[13px] font-medium text-muted-foreground">{title}</CardTitle>
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-foreground/80">
        {icon}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="text-[22px] sm:text-[26px] font-semibold leading-tight">
        {typeof value === "number" ? formatShort(value) : value}
      </div>
      {hint && (
        <div className="mt-3 border-t border-border pt-2">
          <p className="text-[11px] text-muted-foreground/80">{hint}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const HomeOverview: React.FC<HomeOverviewProps> = ({
  stats,
  expiringSubs,
  pendingUsers,
  recentUsers,
  onOpenSubscriptionsExpiry,
  onOpenUsersPending,
  onOpenUsersRecent,
  onClickRenew,
  onClickApprove,
  onClickReject,
}) => {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          hint="+12% from last month"
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          hint="Across all plans"
          icon={<CheckCircle className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue, "INR")}
          hint="+5% vs last month"
          icon={<DollarSign className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Total Pets"
          value={stats.totalPets}
          hint="All registered"
          icon={<PawPrint className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Profile Views"
          value={stats.totalScans}
          hint="Profile views"
          icon={<Eye className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Active Pets"
          value={stats.activePets}
          hint="87% of total"
          icon={<Heart className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      {/* Three compact cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Expiring Subscriptions */}
        <Card className="bg-card ring-1 ring-border rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="text-[14px] font-semibold">Subscriptions Nearing Expiry</span>
              <span className="flex items-center gap-2">
                <Badge variant="secondary">{expiringSubs.length}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  title="View all expiring"
                  aria-label="View all expiring subscriptions"
                  onClick={onOpenSubscriptionsExpiry}
                  className="h-8 w-8"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">Expiring within the next 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {expiringSubs.length === 0 ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span role="img" aria-label="paws">🐾</span> No subscriptions expiring soon.
              </p>
            ) : (
              <div className="space-y-3">
                {expiringSubs.slice(0, 5).map((sub) => {
                  const d = daysLeft(sub.end_date);
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3.5 ring-1 ring-border rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[180px]">
                          {sub.users?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                          {sub.users?.email || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">{sub.users?.phone || "No phone"}</p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant="outline">{sub.plan_type}</Badge>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${urgencyColor(d)}`}>
                            {d}d left
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(sub.end_date).toLocaleDateString()}
                        </p>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <span className="text-xs font-medium">{formatCurrency(sub.amount, "INR")}</span>
                          <ProgressBar value={Math.max(0, 100 - (d / 30) * 100)} />
                        </div>
                        <Button className="mt-2" variant="outline" onClick={() => onClickRenew(sub.id)}>
                          Renew
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Activations */}
        <Card className="bg-card ring-1 ring-border rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="text-[14px] font-semibold">Pending Activations</span>
              <span className="flex items-center gap-2">
                <Badge variant="secondary">{pendingUsers.length}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  title="View all pending"
                  aria-label="View all pending activations"
                  onClick={onOpenUsersPending}
                  className="h-8 w-8"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">Users waiting for activation</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span role="img" aria-label="sparkles">✨</span> No pending activations.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-auto pr-1">
                {pendingUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3.5 border-2 border-gray-200 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[180px]">{user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">{user.email || "—"}</p>
                      <p className="text-xs text-muted-foreground">{user.phone || "—"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onClickApprove(user.id)} aria-label={`Approve ${user.name || "user"}`}>
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => onClickReject(user.id)}
                        aria-label={`Reject ${user.name || "user"}`}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-card ring-1 ring-border rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="text-[14px] font-semibold">Recent Users</span>
              <span className="flex items-center gap-2">
                <Badge variant="secondary">{recentUsers.length}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  title="View all recent"
                  aria-label="View all recent users"
                  onClick={onOpenUsersRecent}
                  className="h-8 w-8"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">Latest registrations</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span role="img" aria-label="eyes">👀</span> No recent users.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-auto pr-1">
                {recentUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3.5 border-2 border-gray-200 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[180px]">{user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">{user.email || "—"}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={user.status === "Active" ? "default" : "destructive"}
                        className={user.status === "Active" ? "bg-green-600 text-white" : ""}
                      >
                        {user.status || "Pending"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Pets: {formatNumber(user.pets)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeOverview;
