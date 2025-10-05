import React, { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, LogOut, PawPrint, Users, Share2, Package } from "lucide-react";
import { toast } from "sonner";

// Services / Types
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/lib/admin";
import { uploadPetPhoto } from "@/lib/pets";
import { inviteService } from "@/lib/invites";
import { subscriptionPlansService, type SubscriptionPlan } from "@/lib/subscriptionPlans";
import type { Pet, User } from "@/lib/supabase";

// Local panels
import HomeOverview from "./home/HomeOverview";
import UsersPanel from "./users/UsersPanel";
import UserModal, { type UserModalMode } from "./users/UserModal";
import SubscriptionsPanel, { type SubscriptionRow } from "./subscriptions/SubscriptionsPanel";
import PlanSelectionDialog from "./subscriptions/PlanSelectionDialog";
import PetsPanel from "./pet-management/PetsPanel";
import PetEditDialog, { type PetEdit } from "./pet-management/PetEditDialog";
import FulfillmentBoard from "./operations/FulfillmentBoard";

// Simple section keys aligned to sidebar
type Section = "home" | "subscriptions" | "users" | "pets" | "fulfillment";

// Extend Pet with owner for admin
interface PetWithOwner extends Pet {
  users?: {
    id: number;
    name: string | null;
    email: string | null;
  };
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();

  // UI section state
  const [section, setSection] = useState<Section>("home");

  // Core data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalPets: 0,
    totalScans: 0,
    activePets: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [pets, setPets] = useState<PetWithOwner[]>([]);
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [expiring, setExpiring] = useState<SubscriptionRow[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  // Filters / tabs
  const [usersTab, setUsersTab] = useState<"pending" | "recent" | "all">("all");
  const [subsTab, setSubsTab] = useState<"expiry" | "list">("list");
  const [userSearch, setUserSearch] = useState("");
  const [subsSearch, setSubsSearch] = useState("");
  const [petSearch, setPetSearch] = useState("");

  // User modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<UserModalMode>("edit");
  const [userModalUser, setUserModalUser] = useState<User | null>(null);

  // Pet editor
  const [petEditorOpen, setPetEditorOpen] = useState(false);
  const [petEditing, setPetEditing] = useState<PetEdit | null>(null);
  const [petUploading, setPetUploading] = useState(false);

  // Plan selection
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planDialogKind, setPlanDialogKind] = useState<"activate" | "renew">("activate");
  const [planDialogUserId, setPlanDialogUserId] = useState<number | null>(null);
  const [planDialogSubId, setPlanDialogSubId] = useState<number | null>(null);
  const [planDialogUserInfo, setPlanDialogUserInfo] = useState<{ name?: string; email?: string } | undefined>();

  // Derived lists used on Home + Users
  const pendingUsers = useMemo(() => users.filter((u) => !u.is_active || u.email_verified === false), [users]);
  const recentUsers = useMemo(() => {
    return users.slice(0, 10).map((u) => {
      const hasEmailPending = u.email_verified === false;
      const status: "Active" | "Inactive" | "Pending" = !u.is_active
        ? "Inactive"
        : hasEmailPending
        ? "Pending"
        : "Active";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: (u as any).phone,
        status,
        pets: pets.filter((p) => p.user_id === u.id).length,
      };
    });
  }, [users, pets]);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const analytics = await adminService.getDashboardAnalytics();
        const [u, p, s, e, pl] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllPetsWithOwners(),
          adminService.getAllSubscriptions(),
          adminService.getSubscriptionsNearingExpiry(),
          subscriptionPlansService.getAllPlans?.() ?? Promise.resolve([]),
        ]);
        setStats({
          totalUsers: analytics.totalUsers,
          activeSubscriptions: analytics.activeSubscriptions,
          monthlyRevenue: analytics.totalRevenue,
          totalPets: analytics.totalPets,
          activePets: analytics.totalPets,
          totalScans: analytics.totalScans,
        });
        setUsers(u);
        setPets(p);
        setSubs(s);
        setExpiring(e);
        setPlans(pl as SubscriptionPlan[]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handlers — Home
  const handleOpenSubscriptionsExpiry = () => {
    setSection("subscriptions");
    setSubsTab("expiry");
  };
  const handleOpenUsersPending = () => {
    setSection("users");
    setUsersTab("pending");
  };
  const handleOpenUsersRecent = () => {
    setSection("users");
    setUsersTab("recent");
  };

  // User actions
  const handleActivateUser = async (userId: number) => {
    const u = users.find((x) => x.id === userId);
    setPlanDialogKind("activate");
    setPlanDialogUserId(userId);
    setPlanDialogSubId(null);
    setPlanDialogUserInfo({ name: u?.name || "", email: u?.email || "" });
    setPlanDialogOpen(true);
  };

  const handleRejectUser = async (userId: number) => {
    try {
      await adminService.deactivateUser(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u)));
      toast.success("User deactivated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to deactivate user");
    }
  };

  const openUserModal = (mode: UserModalMode, user: User) => {
    setUserModalUser(user);
    setUserModalMode(mode);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (updates: Partial<User> & { password?: string }) => {
    try {
      const { password, ...rest } = updates;
      const payload: any = { ...rest };
      if (password) payload.password_plain = password;
      const updated = await adminService.updateUser(updates.id as number, payload);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      toast.success("User updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update user");
    }
  };

  const handleDeactivateUser = async () => {
    if (!userModalUser) return;
    try {
      await adminService.deactivateUser(userModalUser.id);
      setUsers((prev) => prev.map((u) => (u.id === userModalUser.id ? { ...u, is_active: false } : u)));
      toast.success("User deactivated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to deactivate user");
    }
  };

  // Subscription actions
  const handleRenew = (subscriptionId: number) => {
    const sub = subs.find((s) => s.id === subscriptionId);
    setPlanDialogKind("renew");
    setPlanDialogSubId(subscriptionId);
    setPlanDialogUserId(null);
    setPlanDialogUserInfo({ name: sub?.users?.name || "", email: sub?.users?.email || "" });
    setPlanDialogOpen(true);
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    try {
      if (planDialogKind === "activate" && planDialogUserId) {
        await adminService.activateUser(planDialogUserId);
        const today = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + (plan.duration_months || 1));
        const subData = {
          plan_type: (plan.duration_months || 1) >= 12 ? ("annual" as const) : ("monthly" as const),
          amount: plan.amount || 0,
          start_date: today.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
          payment_method: "manual",
          payment_reference: `MANUAL_ACTIVATION_${Date.now()}`,
        };
        await adminService.createSubscription(planDialogUserId, subData);
        const [s, e] = await Promise.all([
          adminService.getAllSubscriptions(),
          adminService.getSubscriptionsNearingExpiry(),
        ]);
        setSubs(s);
        setExpiring(e);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === planDialogUserId
              ? { ...u, is_active: true, email_verified: true, email_verified_at: new Date().toISOString() as any }
              : u
          )
        );
        toast.success(`User activated with ${plan.name}`);
      }

      if (planDialogKind === "renew" && planDialogSubId) {
        const today = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + (plan.duration_months || 1));
        const renewal = {
          status: "active" as const,
          plan_type: (plan.duration_months || 1) >= 12 ? ("annual" as const) : ("monthly" as const),
          amount: plan.amount || 0,
          start_date: today.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
        };
        const updated = await adminService.updateSubscription(planDialogSubId, renewal);
        setSubs((prev) => prev.map((s) => (s.id === planDialogSubId ? { ...s, ...updated } : s)));
        setExpiring((prev) => prev.filter((s) => s.id !== planDialogSubId));
        toast.success(`Subscription renewed with ${plan.name}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to process subscription");
    } finally {
      setPlanDialogOpen(false);
    }
  };

  // Pet actions
  const handleViewPetProfile = (username: string) => {
    const url = `${window.location.origin}/pet/${username}`;
    window.open(url, "_blank");
  };

  const handleDownloadQr = async (pet: PetWithOwner) => {
    try {
      const profileUrl = `${window.location.origin}/pet/${pet.username}`;
      const QRCodeLib = (await import("qrcode")).default;
      const dataUrl = await QRCodeLib.toDataURL(profileUrl, {
        width: 1024,
        margin: 4,
        color: { dark: "#000000", light: "#FFFFFF" },
        errorCorrectionLevel: "H",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${pet.username}.png`;
      link.click();
      toast.success("QR code downloaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate QR code");
    }
  };

  const handleTogglePetStatus = async (petId: number, currentStatus: boolean) => {
    try {
      const next = !currentStatus;
      await adminService.updatePet(petId, { is_active: next });
      setPets((prev) => prev.map((p) => (p.id === petId ? { ...p, is_active: next } : p)));
      toast.success(`Pet ${next ? "activated" : "deactivated"} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update pet status");
    }
  };

  const handleEditPet = (pet: PetWithOwner) => {
    setPetEditing({
      id: pet.id,
      name: pet.name,
      username: pet.username,
      type: (pet as any).type,
      breed: (pet as any).breed,
      age: (pet as any).age,
      color: (pet as any).color,
      description: (pet as any).description,
      photo_url: pet.photo_url || undefined,
      show_phone: (pet as any).show_phone,
      show_whatsapp: (pet as any).show_whatsapp,
      show_instagram: (pet as any).show_instagram,
      show_address: (pet as any).show_address,
      is_active: pet.is_active,
    });
    setPetEditorOpen(true);
  };

  const handleUploadPetPhoto = async (file: File) => {
    if (!petEditing) return;
    try {
      setPetUploading(true);
      const url = await uploadPetPhoto(file, petEditing.username);
      setPetEditing({ ...petEditing, photo_url: url });
      toast.success("Photo uploaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to upload photo");
    } finally {
      setPetUploading(false);
    }
  };

  const handleSavePet = async () => {
    if (!petEditing) return;
    try {
      const updates = { ...petEditing } as any;
      delete updates.id;
      const updated = await adminService.updatePet(petEditing.id, updates);
      setPets((prev) => prev.map((p) => (p.id === petEditing.id ? (updated as any) : p)));
      setPetEditorOpen(false);
      setPetEditing(null);
      toast.success("Pet updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update pet");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      toast.error("Failed to logout");
    }
  };

  const handleShareInvite = async () => {
    try {
      const invite = await inviteService.createInvite(15);
      const inviteUrl = `${window.location.origin}/invite/${invite.token}`;
      if (navigator.share) {
        await navigator.share({ title: "WhiteTag Invite", text: "Join WhiteTag and add your pet", url: inviteUrl });
        toast.success("Invite shared (expires in 15 min)");
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success("Invite link copied (expires in 15 min)");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to create/share invite");
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Card className="ring-1 ring-border rounded-xl">
          <CardContent className="p-8 text-center">
            <div className="text-xl font-semibold">Loading Admin Dashboard…</div>
            <div className="text-sm text-muted-foreground mt-2">Fetching latest data</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pageTitle =
    section === "subscriptions"
      ? "Subscriptions"
      : section === "users"
      ? "Users"
      : section === "pets"
      ? "Pet Management"
      : section === "fulfillment"
      ? "Orders"
      : "WhiteTag";

  const sidebarStyles = { "--sidebar-width": "13rem" } as CSSProperties;

  return (
    <SidebarProvider style={sidebarStyles}>
      <Sidebar collapsible="icon" className="overflow-x-hidden">
        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={section === "home"} onClick={() => setSection("home")} tooltip="Home">
                  <Users />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={section === "subscriptions"} onClick={() => setSection("subscriptions")} tooltip="Subscriptions">
                  <CreditCard />
                  <span>Subscriptions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={section === "users"} onClick={() => setSection("users")} tooltip="Users">
                  <Users />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={section === "pets"} onClick={() => setSection("pets")} tooltip="Pet Management">
                  <PawPrint />
                  <span>Pet Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={section === "fulfillment"} onClick={() => setSection("fulfillment")} tooltip="Orders">
                  <Package />
                  <span>Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        {/* Header — updated colorway */}
        <header className="bg-black border-white/15">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-white hover:bg-white" />
              <div className="flex flex-col">
                <span className="text-2xl text-white font-extrabold tracking-tight leading-none">{pageTitle}</span>
                <span className="text-xs text-white/80 leading-none mt-1">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Share Invite"
                className="rounded-full text-white hover:text-white bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/30 hover:border-white/40 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/40"
                onClick={handleShareInvite}
              >
                <Share2 className="w-4 h-4 mr-2 text-white" /> Share Invite
              </Button>
              <Button variant="destructive" className="bg-red-600/90 hover:bg-red-700" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="container mx-auto px-4 py-8 space-y-8">
          {section === "home" && (
            <HomeOverview
              stats={stats}
              expiringSubs={expiring}
              pendingUsers={pendingUsers}
              recentUsers={recentUsers}
              onOpenSubscriptionsExpiry={handleOpenSubscriptionsExpiry}
              onOpenUsersPending={handleOpenUsersPending}
              onOpenUsersRecent={handleOpenUsersRecent}
              onClickRenew={handleRenew}
              onClickApprove={handleActivateUser}
              onClickReject={handleRejectUser}
            />
          )}

          {section === "users" && (
            <UsersPanel
              users={users}
              recentUsers={recentUsers}
              pendingUsers={pendingUsers}
              activeTab={usersTab}
              onChangeTab={setUsersTab}
              search={userSearch}
              onSearchChange={setUserSearch}
              onActivate={handleActivateUser}
              onReject={handleRejectUser}
              onOpenUserModal={(mode, user) => openUserModal(mode, user)}
            />
          )}

          {section === "subscriptions" && (
            <SubscriptionsPanel
              activeTab={subsTab}
              onChangeTab={setSubsTab}
              subscriptions={subs}
              expiringSubs={expiring}
              search={subsSearch}
              onSearchChange={setSubsSearch}
              onRenew={handleRenew}
            />
          )}

          {section === "pets" && (
            <PetsPanel
              pets={pets as any}
              totalCount={pets.length}
              search={petSearch}
              onSearchChange={setPetSearch}
              onViewProfile={handleViewPetProfile}
              onDownloadQr={handleDownloadQr}
              onToggleStatus={handleTogglePetStatus}
              onEditPet={handleEditPet}
            />
          )}

          {section === "fulfillment" && (
            <FulfillmentBoard />
          )}
        </div>
      </SidebarInset>

      {/* Dialogs */}
      <UserModal
        open={userModalOpen}
        mode={userModalMode}
        user={userModalUser || undefined}
        subscriptions={subs.filter((s) => (userModalUser ? (s as any).user_id === userModalUser.id : false))}
        pets={pets.filter((p) => (userModalUser ? p.user_id === userModalUser.id : false)) as any}
        onClose={() => setUserModalOpen(false)}
        onSaveUser={handleSaveUser}
        onDeactivateUser={handleDeactivateUser}
      />

      <PetEditDialog
        open={petEditorOpen}
        pet={petEditing}
        uploading={petUploading}
        onClose={() => setPetEditorOpen(false)}
        onUploadPhoto={handleUploadPetPhoto}
        onChange={(u) => setPetEditing((prev) => (prev ? { ...prev, ...u } : prev))}
        onSave={handleSavePet}
      />

      <PlanSelectionDialog
        open={planDialogOpen}
        title={planDialogKind === "activate" ? "Select Activation Plan" : "Select Renewal Plan"}
        description={
          planDialogKind === "activate"
            ? "Choose a subscription plan to activate this user"
            : "Choose a subscription plan to renew this subscription"
        }
        userInfo={planDialogUserInfo}
        plans={plans}
        onSelect={handleSelectPlan}
        onClose={() => setPlanDialogOpen(false)}
      />
    </SidebarProvider>
  );
};

export default AdminDashboard;






