import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Heart, 
  DollarSign, 
  Search, 
  CheckCircle, 
  XCircle,
  Calendar,
  LogOut,
  Edit,
  Eye,
  PawPrint,
  Save,
  Loader2,
  CreditCard,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  Upload,
  QrCode,
  Download,
  Settings
} from "lucide-react";
import QRCodeLib from "qrcode";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/lib/admin";
import { petService, uploadPetPhoto } from "@/lib/pets";
import { subscriptionPlansService, type SubscriptionPlan } from "@/lib/subscriptionPlans";
import type { Pet, User } from "@/lib/supabase";
import { toast } from "sonner";
import SubscriptionPlansManagement from "./SubscriptionPlansManagement";
import PlanSelectionDialog from "./PlanSelectionDialog";

// Extended Pet type for admin dashboard with owner info
interface PetWithOwner extends Pet {
  users?: {
    id: number
    name: string
    email: string
    phone?: string
    whatsapp?: string
    instagram?: string
    address?: string
  }
}

const AdminDashboard = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [editingPet, setEditingPet] = useState<PetWithOwner | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Plan selection dialog state
  const [planSelectionDialog, setPlanSelectionDialog] = useState<{
    open: boolean;
    type: 'activate' | 'renew';
    userId?: number;
    subscriptionId?: number;
    userInfo?: { name: string; email: string };
  }>({
    open: false,
    type: 'activate'
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingActivations: 0,
    monthlyRevenue: 0,
    totalPets: 0,
    activePets: 0,
    totalScans: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [pets, setPets] = useState<PetWithOwner[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [expiringSubs, setExpiringSubs] = useState<any[]>([]);

  // Load admin dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load analytics
        const analyticsData = await adminService.getDashboardAnalytics();
        setStats({
          totalUsers: analyticsData.totalUsers,
          activeSubscriptions: analyticsData.activeSubscriptions,
          pendingActivations: 0,
          monthlyRevenue: analyticsData.totalRevenue,
          totalPets: analyticsData.totalPets,
          activePets: analyticsData.totalPets, // Assume all pets are active for now
          totalScans: analyticsData.totalScans
        });
        
        // Load users, pets, and subscriptions
        const [usersData, petsData, subscriptionsData, expiringData] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllPetsWithOwners(),
          adminService.getAllSubscriptions(),
          adminService.getSubscriptionsNearingExpiry()
        ]);
        
        setUsers(usersData);
        setPets(petsData);
        setSubscriptions(subscriptionsData);
        setExpiringSubs(expiringData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculate pets with owner count for recent users
  const recentUsers = users.slice(0, 10).map(user => {
    const userPetCount = pets.filter(pet => pet.user_id === user.id).length;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.is_active ? "Active" : "Pending",
      pets: userPetCount
    };
  });

  // UPDATED: activateUser function with plan selection
  const activateUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setPlanSelectionDialog({
      open: true,
      type: 'activate',
      userId,
      userInfo: { name: user.name, email: user.email }
    });
  };

  // Handle plan selection for activation
  const handlePlanSelection = async (plan: SubscriptionPlan) => {
    try {
      if (planSelectionDialog.type === 'activate' && planSelectionDialog.userId) {
        // 1. Activate the user
        await adminService.activateUser(planSelectionDialog.userId);
        
        // 2. Create subscription with selected plan
        const today = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.duration_months);
        
        const subscriptionData = {
          plan_type: plan.duration_months >= 12 ? 'annual' as const : 'monthly' as const,
          amount: plan.amount,
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          payment_method: 'manual',
          payment_reference: `MANUAL_ACTIVATION_${Date.now()}`
        };
        
        await adminService.createSubscription(planSelectionDialog.userId, subscriptionData);
        
        // 3. Update UI
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === planSelectionDialog.userId 
              ? { 
                  ...user, 
                  is_active: true, 
                  email_verified: true, 
                  email_verified_at: new Date().toISOString() 
                }
              : user
          )
        );
        
        // 4. Refresh data
        const [updatedSubscriptions, updatedExpiringSubs] = await Promise.all([
          adminService.getAllSubscriptions(),
          adminService.getSubscriptionsNearingExpiry()
        ]);
        
        setSubscriptions(updatedSubscriptions);
        setExpiringSubs(updatedExpiringSubs);
        
        setStats(prevStats => ({
          ...prevStats,
          activeSubscriptions: prevStats.activeSubscriptions + 1,
          pendingActivations: Math.max(0, prevStats.pendingActivations - 1)
        }));
        
        toast.success(`User activated with ${plan.name} (₹${plan.amount}) for ${plan.duration_months} months!`);
      } else if (planSelectionDialog.type === 'renew' && planSelectionDialog.subscriptionId) {
        // Handle subscription renewal with selected plan
        const today = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.duration_months);
        
        const renewalData = {
          status: 'active' as const,
          plan_type: plan.duration_months >= 12 ? 'annual' as const : 'monthly' as const,
          amount: plan.amount,
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        };
        
        const updatedSub = await adminService.updateSubscription(planSelectionDialog.subscriptionId, renewalData);
        
        setSubscriptions(prevSubs => 
          prevSubs.map(sub => 
            sub.id === planSelectionDialog.subscriptionId ? updatedSub : sub
          )
        );
        
        setExpiringSubs(prevSubs => 
          prevSubs.filter(sub => sub.id !== planSelectionDialog.subscriptionId)
        );
        
        toast.success(`Subscription renewed with ${plan.name} (₹${plan.amount}) for ${plan.duration_months} months!`);
      }
    } catch (error) {
      console.error('Failed to process plan selection:', error);
      toast.error('Failed to process subscription. Please try again.');
    }
  };

  const rejectUser = async (userId: number) => {
    try {
      await adminService.deactivateUser(userId);
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_active: false } : user
        )
      );
      
      setStats(prevStats => ({
        ...prevStats,
        pendingActivations: Math.max(0, prevStats.pendingActivations - 1)
      }));
      
      toast.success("User deactivated successfully!");
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      toast.error("Failed to deactivate user. Please try again.");
    }
  };

  const handleEditPet = (pet: any) => {
    setEditingPet({ ...pet });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingPet) return;

    try {
      setUploadingPhoto(true);
      const photoUrl = await uploadPetPhoto(file, editingPet.username);
      setEditingPet({ ...editingPet, photo_url: photoUrl });
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSavePet = async () => {
    if (!editingPet) return;
    
    try {
      const updates = {
        name: editingPet.name,
        username: editingPet.username,
        type: editingPet.type,
        breed: editingPet.breed,
        age: editingPet.age,
        color: editingPet.color,
        description: editingPet.description,
        photo_url: editingPet.photo_url,
        show_phone: editingPet.show_phone,
        show_whatsapp: editingPet.show_whatsapp,
        show_instagram: editingPet.show_instagram,
        show_address: editingPet.show_address,
        is_active: editingPet.is_active
      };
      
      const updatedPet = await adminService.updatePet(editingPet.id, updates);
      
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === editingPet.id ? updatedPet : pet
        )
      );
      
      setEditingPet(null);
      toast.success("Pet updated successfully!");
    } catch (error) {
      console.error("Failed to update pet:", error);
      toast.error("Failed to update pet. Please try again.");
    }
  };

  const handleViewPetProfile = (username: string) => {
    const profileUrl = `${window.location.origin}/pet/${username}`;
    window.open(profileUrl, '_blank');
  };

  const handleTogglePetStatus = async (petId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await adminService.updatePet(petId, { is_active: newStatus });
      
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === petId ? { ...pet, is_active: newStatus } : pet
        )
      );
      
      toast.success(`Pet ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Failed to toggle pet status:", error);
      toast.error("Failed to update pet status. Please try again.");
    }
  };

  const handleDownloadQRCode = async (pet: PetWithOwner) => {
    try {
      const profileUrl = `${window.location.origin}/pet/${pet.username}`;
      
      const qrCodeDataUrl = await QRCodeLib.toDataURL(profileUrl, {
        width: 1024,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H'
      });

      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `${pet.username}.png`;
      link.click();
      
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  // UPDATED: handleRenewSubscription with plan selection
  const handleRenewSubscription = async (subscriptionId: number) => {
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) return;

    setPlanSelectionDialog({
      open: true,
      type: 'renew',
      subscriptionId,
      userInfo: { name: subscription.users?.name || '', email: subscription.users?.email || '' }
    });
  };

  const pendingUsers = users.filter(user => !user.is_active || user.email_verified === false);

  const filteredPets = pets.filter(pet => 
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.users?.name?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
    sub.users?.email?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
    sub.plan_type?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
    sub.status?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase())
  );

  const filteredExpiringSubs = expiringSubs.filter(sub => 
    sub.users?.name?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
    sub.users?.email?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
    sub.plan_type?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
    sub.status?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase())
  );

  const PetEditModal = () => (
    <Dialog open={!!editingPet} onOpenChange={(open) => !open && setEditingPet(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pet Details</DialogTitle>
          <DialogDescription>
            Update pet information and privacy settings
          </DialogDescription>
        </DialogHeader>
        {editingPet && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="photo">Pet Photo</Label>
                  <div className="flex flex-col space-y-2">
                    {editingPet.photo_url && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden border">
                        <img 
                          src={editingPet.photo_url} 
                          alt={editingPet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label htmlFor="photo-upload">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" className="w-fit" disabled={uploadingPhoto}>
                        <span className="flex items-center">
                          {uploadingPhoto ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="petName">Pet Name</Label>
                <Input
                  id="petName"
                  value={editingPet.name}
                  onChange={(e) => setEditingPet({...editingPet, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="petUsername">Username</Label>
                <Input
                  id="petUsername"
                  value={editingPet.username}
                  onChange={(e) => setEditingPet({...editingPet, username: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="petType">Type</Label>
                <select
                  id="petType"
                  value={editingPet.type}
                  onChange={(e) => setEditingPet({...editingPet, type: e.target.value as 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other'})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  value={editingPet.breed}
                  onChange={(e) => setEditingPet({...editingPet, breed: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="petAge">Age</Label>
                <Input
                  id="petAge"
                  value={editingPet.age}
                  onChange={(e) => setEditingPet({...editingPet, age: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="petColor">Color</Label>
              <Input
                id="petColor"
                value={editingPet.color}
                onChange={(e) => setEditingPet({...editingPet, color: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="petDescription">Description</Label>
              <Textarea
                id="petDescription"
                value={editingPet.description}
                onChange={(e) => setEditingPet({...editingPet, description: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Privacy Settings</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showPhone"
                    checked={editingPet.show_phone}
                    onChange={(e) => setEditingPet({...editingPet, show_phone: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="showPhone">Show Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showWhatsApp"
                    checked={editingPet.show_whatsapp}
                    onChange={(e) => setEditingPet({...editingPet, show_whatsapp: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="showWhatsApp">Show WhatsApp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showInstagram"
                    checked={editingPet.show_instagram}
                    onChange={(e) => setEditingPet({...editingPet, show_instagram: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="showInstagram">Show Instagram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showAddress"
                    checked={editingPet.show_address}
                    onChange={(e) => setEditingPet({...editingPet, show_address: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="showAddress">Show Address</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingPet(null)}>
                Cancel
              </Button>
              <Button onClick={handleSavePet} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const handleAdminLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Admin logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Admin Dashboard</h2>
          <p className="text-gray-600">Please wait while we fetch the latest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-2xl font-bold">WhiteTag Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={handleAdminLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage WhiteTag users, pets, and subscriptions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-500">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Various plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
              <PawPrint className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPets.toLocaleString()}</div>
              <p className="text-xs text-gray-500">All registered pets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Total profile views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Pets</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePets.toLocaleString()}</div>
              <p className="text-xs text-gray-500">87% of total pets</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different admin sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="pets">Pet Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Pending Activations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Pending Activations
                    <Badge variant="secondary">{pendingUsers.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Users waiting for subscription activation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">{user.phone}</p>
                          <p className="text-xs text-gray-500">
                            Registered: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => activateUser(user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectUser(user.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>
                    Latest user registrations and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pets</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{user.phone || 'Not provided'}</p>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.status === "Active" ? "default" : "destructive"}
                              className={user.status === "Active" ? "bg-green-600" : ""}
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.pets}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            {/* Subscription Alerts */}
            {filteredExpiringSubs.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Subscriptions Nearing Expiry
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    {filteredExpiringSubs.length} subscriptions expire within the next 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredExpiringSubs.slice(0, 5).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                        <div>
                          <p className="font-medium">{sub.users?.name}</p>
                          <p className="text-sm text-gray-600">{sub.users?.email}</p>
                          <p className="text-sm text-gray-600">{sub.users?.phone || 'No phone'}</p>
                          <p className="text-xs text-orange-700">
                            Expires: {new Date(sub.end_date).toLocaleDateString()} 
                            <span className="ml-2">
                              ({Math.ceil((new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days)
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-orange-400 text-orange-700">
                            {sub.plan_type}
                          </Badge>
                          <p className="text-sm font-medium mt-1">₹{sub.amount}</p>
                          <Button
                            size="sm"
                            onClick={() => handleRenewSubscription(sub.id)}
                            className="bg-green-600 hover:bg-green-700 mt-2"
                          >
                            Renew
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  All Subscriptions
                  <Badge variant="secondary">{subscriptions.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Manage all user subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search subscriptions..."
                      value={subscriptionSearchTerm}
                      onChange={(e) => setSubscriptionSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sub.users?.name}</p>
                            <p className="text-sm text-gray-600">{sub.users?.email}</p>
                            <p className="text-sm text-gray-600">{sub.users?.phone || 'No phone'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {sub.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={sub.status === 'active' ? 'default' : 'destructive'}
                            className={sub.status === 'active' ? 'bg-green-600' : ''}
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{sub.amount}</TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(sub.end_date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            {Math.ceil((new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRenewSubscription(sub.id)}
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <SubscriptionPlansManagement onPlansUpdate={() => {
              // Refresh data when plans are updated
              // This ensures the plan selection dialog shows updated plans
            }} />
          </TabsContent>

          <TabsContent value="pets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pet Management
                  <Badge variant="secondary">{pets.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Manage all pet profiles and QR codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search pets by name, owner, or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPets.map((pet) => (
                      <TableRow key={pet.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {pet.photo_url && (
                              <img 
                                src={pet.photo_url} 
                                alt={pet.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{pet.name}</p>
                              <p className="text-sm text-gray-600">@{pet.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{pet.users?.name}</p>
                            <p className="text-sm text-gray-600">{pet.users?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {pet.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={pet.is_active ? 'default' : 'destructive'}
                            className={pet.is_active ? 'bg-green-600' : ''}
                          >
                            {pet.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(pet.created_at).toLocaleDateString()}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewPetProfile(pet.username)}
                              title="View Pet Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadQRCode(pet)}
                              title="Download HD QR Code"
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            >
                              <QrCode className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTogglePetStatus(pet.id, pet.is_active)}
                              className={pet.is_active ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
                              title={pet.is_active ? "Deactivate Pet" : "Activate Pet"}
                            >
                              {pet.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditPet(pet)}
                              className="bg-blue-600 hover:bg-blue-700"
                              title="Edit Pet Details"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Plan Selection Dialog */}
      <PlanSelectionDialog
        open={planSelectionDialog.open}
        onClose={() => setPlanSelectionDialog({ open: false, type: 'activate' })}
        onPlanSelect={handlePlanSelection}
        title={planSelectionDialog.type === 'activate' ? 'Select Activation Plan' : 'Select Renewal Plan'}
        description={planSelectionDialog.type === 'activate' 
          ? 'Choose a subscription plan to activate this user' 
          : 'Choose a subscription plan to renew this subscription'
        }
        userInfo={planSelectionDialog.userInfo}
      />

      <PetEditModal />
    </div>
  );
};

export default AdminDashboard;