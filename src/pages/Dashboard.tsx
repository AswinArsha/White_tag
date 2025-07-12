
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Settings, Heart, Phone, MessageCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { petService } from "@/lib/pets";
import { authService } from "@/lib/auth";
import type { Pet } from "@/lib/supabase";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, isAdmin, logout } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPets: 0,
    totalScans: 0,
    lostPets: 0,
    activePets: 0,
    subscriptionStatus: 'Unknown',
    subscriptionDaysLeft: 0
  });

  // Load user's pets and statistics
  useEffect(() => {
    const loadUserData = async () => {
      if (!profile) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Get user's pets
        const userPets = await petService.getUserPets(profile.id);
        setPets(userPets);
        
        // Update stats
        const totalScans = userPets.reduce((sum, pet) => sum + (pet.total_scans || 0), 0);
        const lostPets = userPets.filter(pet => pet.is_lost).length;
        
        // Get subscription status
        const subscriptionStatus = await authService.getSubscriptionStatus(profile.id);
        
        setStats({
          totalPets: userPets.length,
          totalScans,
          lostPets,
          activePets: userPets.filter(pet => pet.is_active).length,
          subscriptionStatus: subscriptionStatus.isActive ? 'Active' : 'Inactive',
          subscriptionDaysLeft: subscriptionStatus.daysRemaining || 0
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast.error('Failed to load your dashboard data');
        
        // Only redirect if not admin
        if (!isAdmin) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [profile, isAdmin, navigate]);

  const viewPetProfile = (petUsername: string) => {
    const profileUrl = `${window.location.origin}/pet/${petUsername}`;
    window.open(profileUrl, '_blank');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">WhiteTag</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.name}
            </span>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading your dashboard...</span>
          </div>
        ) : (
          <>
        {/* Subscription Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Subscription Status
              {stats.subscriptionStatus === 'Inactive' && (
                <Badge variant="destructive">Inactive</Badge>
              )}
              {stats.subscriptionStatus === 'Active' && (
                <Badge variant="default" className="bg-green-600">Active</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.subscriptionStatus === 'Inactive' ? (
              <div className="text-center py-6">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2 text-gray-900">Subscription Not Active</p>
                <p className="text-gray-600 mb-4">
                  Contact our admin to activate your ₹599/year subscription and unlock all features
                </p>
                <div className="flex justify-center space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Admin
                  </Button>
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Admin
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-lg font-medium text-green-600">
                  Active - {stats.subscriptionDaysLeft} days remaining
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pet Management */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Pets</h2>
              <Link to="/dashboard/add-pet">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pet
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {pets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pets yet</h3>
                  <p className="text-gray-600 mb-6">Add your first pet to get started with WhiteTag protection</p>
                  <Link to="/dashboard/add-pet">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Pet
                    </Button>
                  </Link>
                </div>
              ) : (
                pets.map((pet) => (
                <Card key={pet.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={pet.photo_url || "/placeholder.svg"}
                        alt={pet.name}
                        className="w-16 h-16 rounded-full object-cover bg-gray-100"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                        <p className="text-gray-600">{pet.type} • {pet.breed}</p>
                        <p className="text-sm text-blue-600">whitetag.com/pet/{pet.username}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-300 w-24"
                          onClick={() => viewPetProfile(pet.username)}
                        >
                          View Profile
                        </Button>
                        <Link to={`/dashboard/edit-pet/${pet.id}`}>
                          <Button size="sm" variant="outline" className="border-gray-300 w-24">
                            Edit Pet
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Pets</span>
                    <span className="font-semibold text-gray-900">{stats.totalPets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Pets</span>
                    <span className="font-semibold text-gray-900">{stats.activePets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Scans</span>
                    <span className="font-semibold text-gray-900">{stats.totalScans}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-gray-300">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Help
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
