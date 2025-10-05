import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, RefreshCw } from "lucide-react";
import SubscriptionPlansManagement from "./SubscriptionPlansManagement";

export type SubscriptionRow = {
  id: number;
  plan_type: string; // 'monthly' | 'annual' | etc
  status: string;    // 'active' | 'expired' | ...
  amount: number;
  end_date: string;  // ISO
  users?: { name?: string; email?: string; phone?: string };
};

export type SubscriptionsPanelProps = {
  activeTab: "expiry" | "list";
  onChangeTab: (tab: "expiry" | "list") => void;

  subscriptions: SubscriptionRow[];
  expiringSubs: SubscriptionRow[];

  search: string;
  onSearchChange: (v: string) => void;

  onRenew: (subscriptionId: number) => void;
};

// ---------- Utils ----------
const msPerDay = 1000 * 60 * 60 * 24;
const daysLeft = (isoDate: string) =>
  Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / msPerDay));

const formatNumber = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const formatCurrency = (n: number, currency: string = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

const formatShort = (n: number) => {
  if (n >= 1_00_00_000) return (n / 1_00_00_000).toFixed(1) + "Cr";
  if (n >= 1_00_000) return (n / 1_00_000).toFixed(1) + "L";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return `${n}`;
};

const urgencyColor = (d: number) =>
  d <= 3 ? "bg-red-500 text-white"
  : d <= 7 ? "bg-amber-500 text-white"
  : "bg-muted-foreground text-white";

// ---------- Component ----------
const SubscriptionsPanel: React.FC<SubscriptionsPanelProps> = ({
  activeTab,
  onChangeTab,
  subscriptions,
  expiringSubs,
  search,
  onSearchChange,
  onRenew,
}) => {
  const filteredAll = React.useMemo(() => {
    const q = search.toLowerCase();
    return subscriptions.filter((s) =>
      (s.users?.name || "").toLowerCase().includes(q) ||
      (s.users?.email || "").toLowerCase().includes(q) ||
      (s.users?.phone || "").toLowerCase().includes(q) ||
      (s.plan_type || "").toLowerCase().includes(q) ||
      (s.status || "").toLowerCase().includes(q)
    );
  }, [subscriptions, search]);

  const HeaderShell: React.FC<{ title: string; count?: number; desc?: string; right?: React.ReactNode }> = ({ title, count, desc, right }) => (
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center justify-between">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="inline-flex items-center gap-2">
          {typeof count === "number" && <Badge variant="secondary">{formatNumber(count)}</Badge>}
          {right}
        </span>
      </CardTitle>
      {desc && <CardDescription className="text-muted-foreground">{desc}</CardDescription>}
    </CardHeader>
  );

  const TableShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-background overflow-hidden rounded-md border">
      <Table className="min-w-[820px] [&_th]:h-9 [&_th]:py-2 [&_td]:py-2">{children}</Table>
    </div>
  );

  const ExpiringTableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>User</TableHead>
        <TableHead>Plan</TableHead>
        <TableHead className="text-right">Ends</TableHead>
        <TableHead className="text-right">Days Left</TableHead>
        <TableHead className="text-right">Amount</TableHead>
        <TableHead className="w-[120px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const AllTableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>User</TableHead>
        <TableHead>Plan</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="">Amount</TableHead>
        <TableHead className="">End Date</TableHead>
        <TableHead className="w-[120px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderExpiringTable = (rows: SubscriptionRow[]) => (
    <TableShell>
      {ExpiringTableHeader}
      <TableBody>
        {rows.map((sub) => {
          const d = daysLeft(sub.end_date);
          return (
            <TableRow key={sub.id}>
              <TableCell className="align-top">
                <div className="min-w-0">
                  <p className="font-medium truncate max-w-[220px]">{sub.users?.name || "—"}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[260px]">{sub.users?.email || "—"}</p>
                  <p className="text-xs text-muted-foreground">{sub.users?.phone || "No phone"}</p>
                </div>
              </TableCell>
              <TableCell className="align-top">
                <Badge variant="outline" className="capitalize">{sub.plan_type}</Badge>
              </TableCell>
              <TableCell className="align-top text-right">
                {new Date(sub.end_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="align-top text-right">
                <span className={`px-2 py-0.5 rounded-full text-[11px] ${urgencyColor(d)}`}>{d}d</span>
              </TableCell>
              <TableCell className="align-top text-right">
                {formatCurrency(sub.amount)}
              </TableCell>
              <TableCell className="align-top">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRenew(sub.id)}
                  aria-label={`Renew subscription ${sub.id}`}
                >
                  <RefreshCw className="w-4 h-4 mr-1" /> Renew
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </TableShell>
  );

  const renderAllTable = (rows: SubscriptionRow[]) => (
    <TableShell>
      {AllTableHeader}
      <TableBody>
        {rows.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell className="align-top">
              <div className="min-w-0">
                <p className="font-medium truncate max-w-[220px]">{sub.users?.name || "—"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[260px]">{sub.users?.email || "—"}</p>
                <p className="text-xs text-muted-foreground">{sub.users?.phone || "No phone"}</p>
              </div>
            </TableCell>
            <TableCell className="align-top">
              <Badge variant="outline" className="capitalize">{sub.plan_type}</Badge>
            </TableCell>
            <TableCell className="align-top">
              <Badge
                variant={sub.status === "active" ? "default" : "destructive"}
                className={sub.status === "active" ? "bg-green-600 text-white" : ""}
              >
                {sub.status}
              </Badge>
            </TableCell>
            <TableCell className="align-top ">
              {formatCurrency(sub.amount)}
            </TableCell>
            <TableCell className="align-top ">
              <p className="text-sm">{new Date(sub.end_date).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">{daysLeft(sub.end_date)} days left</p>
            </TableCell>
            <TableCell className="align-top">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRenew(sub.id)}
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  aria-label={`Renew subscription ${sub.id}`}
                  title="Renew"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableShell>
  );

  return (
    <Card className="bg-card ring-1 ring-border rounded-xl">
      <HeaderShell
        title="Subscriptions"
        count={subscriptions.length}
        desc="Manage all user subscriptions"
      />

      <CardContent className="space-y-5">
        {/* Tabs as segmented control */}
        <Tabs value={activeTab} onValueChange={(v) => onChangeTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 rounded-lg ring-1 ring-border">
            <TabsTrigger value="expiry" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
              Expiring Soon
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
              All Subscriptions
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
              Subscription Plans
            </TabsTrigger>
          </TabsList>

          {/* Expiry Tab */}
          <TabsContent value="expiry" className="space-y-4">
            {expiringSubs.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center">
                Nothing expiring in the next 30 days. 🎉
              </div>
            ) : (
              renderExpiringTable(expiringSubs)
            )}
          </TabsContent>

          {/* All List Tab */}
          <TabsContent value="list" className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search name, email, phone, plan, status…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
                aria-label="Search subscriptions"
              />
              {search && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-2.5 h-5 w-5 rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                  title="Clear"
                >
                  ×
                </button>
              )}
            </div>

            {filteredAll.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center">
                No subscriptions match your search.
              </div>
            ) : (
              renderAllTable(filteredAll)
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            <SubscriptionPlansManagement
              onPlansUpdate={() => {
                // Optionally trigger a refetch of subscriptions/plans if needed.
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsPanel;
