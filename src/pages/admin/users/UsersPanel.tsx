import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, CreditCard, PawPrint, Trash2, Power } from "lucide-react";
import type { User } from "@/lib/supabase";

export type UsersPanelProps = {
  users: User[];
  recentUsers: Array<{
    id: number;
    name: string | null;
    email: string | null;
    phone?: string | null;
    status: "Active" | "Pending" | "Inactive";
    pets: number;
  }>;
  pendingUsers: User[];
  activeTab: "pending" | "recent" | "all";
  onChangeTab: (tab: "pending" | "recent" | "all") => void;
  search: string;
  onSearchChange: (v: string) => void;
  onActivate: (userId: number) => void;
  onReject: (userId: number) => void;
  onOpenUserModal: (type: "edit" | "subscription" | "pets" | "delete", user: User) => void;
};

// Locale helpers (optional — used for pets count formatting)
const formatNumber = (n: number) => new Intl.NumberFormat("en-IN").format(n);

const UsersPanel: React.FC<UsersPanelProps> = ({
  users,
  recentUsers,
  pendingUsers,
  activeTab,
  onChangeTab,
  search,
  onSearchChange,
  onActivate,
  onReject,
  onOpenUserModal,
}) => {
  const filteredAll = React.useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const HeaderShell: React.FC<{ title: string; count?: number; desc?: string }> = ({ title, count, desc }) => (
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center justify-between">
        <span className="text-[15px] font-semibold">{title}</span>
        {typeof count === "number" && <Badge variant="secondary">{formatNumber(count)}</Badge>}
      </CardTitle>
      {desc && <CardDescription className="text-muted-foreground">{desc}</CardDescription>}
    </CardHeader>
  );

  const TableShell: React.FC<{ children: React.ReactNode; minWidth?: number }> = ({ children, minWidth = 860 }) => (
    <div className="bg-background overflow-hidden rounded-md border">
      <Table className={`min-w-[${minWidth}px] [&_th]:h-9 [&_th]:py-2 [&_td]:py-2` as any}>{children}</Table>
    </div>
  );

  const PendingHeader = (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Registered</TableHead>
        <TableHead className="w-[200px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const RecentHeader = (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-center">Pets</TableHead>
      </TableRow>
    </TableHeader>
  );

  const AllHeader = (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-[140px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <Card className="bg-card ring-1 ring-border rounded-xl">
      <HeaderShell title="All Users" count={users.length} desc="Manage user accounts and details" />

      <CardContent className="space-y-5">
        <Tabs value={activeTab} onValueChange={(v) => onChangeTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 rounded-lg ring-1 ring-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
              Pending
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
              Recent
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
              All
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending" className="space-y-4">
            {pendingUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center">No pending activations.</div>
            ) : (
              <TableShell>
                {PendingHeader}
                <TableBody>
                  {pendingUsers.slice(0, 100).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[240px]">{u.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="truncate max-w-[280px]">{u.email || "—"}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onActivate(u.id)} aria-label={`Approve ${u.name || "user"}`}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => onReject(u.id)}
                            aria-label={`Reject ${u.name || "user"}`}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableShell>
            )}
          </TabsContent>

          {/* Recent */}
          <TabsContent value="recent" className="space-y-4">
            {recentUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center">No recent users.</div>
            ) : (
              <TableShell>
                {RecentHeader}
                <TableBody>
                  {recentUsers.slice(0, 100).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[240px]">{u.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="truncate max-w-[280px]">{u.email || "—"}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === "Active" ? "default" : "destructive"} className={u.status === "Active" ? "bg-green-600 text-white" : ""}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{formatNumber(u.pets)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableShell>
            )}
          </TabsContent>

          {/* All */}
          <TabsContent value="all" className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search users by name, email, or phone…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
                aria-label="Search users"
              />
           
            </div>

            {filteredAll.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center">No users match your search.</div>
            ) : (
              <TableShell>
                {AllHeader}
                <TableBody>
                  {filteredAll.map((u) => (
                    <TableRow key={u.id} className="odd:bg-muted/20 hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[240px]">{u.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="truncate max-w-[280px]">{u.email || "—"}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? "default" : "destructive"} className={u.is_active ? "bg-green-600 text-white" : ""}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="User actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem onClick={() => onOpenUserModal("edit", u)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onOpenUserModal("subscription", u)}>
                              <CreditCard className="h-4 w-4 mr-2" /> Subscription Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onOpenUserModal("pets", u)}>
                              <PawPrint className="h-4 w-4 mr-2" /> Pet Details
                            </DropdownMenuItem>
                            {u.is_active ? (
                              <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => onOpenUserModal("delete", u)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                              className="text-green-600 focus:text-green-700"
                               onClick={() => onActivate(u.id)}>
                                <Power className="h-4 w-4 mr-2" /> Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableShell>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UsersPanel;
