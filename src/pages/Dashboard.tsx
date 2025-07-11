
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, QrCode, Calendar, Settings, Heart, Phone, MessageCircle, Download, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import QRCodeLib from "qrcode";
import { useAuth } from "@/contexts/AuthContext";
import { petService } from "@/lib/pets";
import { authService } from "@/lib/auth";
import type { Pet } from "@/lib/supabase";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, isDemo, isAdmin, logout } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isActive: false,
    daysRemaining: 0,
    planType: "Annual" as "Annual" | "Monthly",
    endDate: null as string | null
  });

  const [pets, setPets] = useState<Pet[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState<Record<number, boolean>>({});

  // Load user data and pets on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!profile) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);

        // Load user's pets
        const userPets = await petService.getUserPets(profile.id);
        setPets(userPets);

        // Load subscription status if not demo/admin
        if (!isDemo && !isAdmin) {
          const subStatus = await authService.getSubscriptionStatus(profile.id);
          setSubscriptionStatus(subStatus);
        } else {
          // Demo users get active subscription
          setSubscriptionStatus({
            isActive: true,
            daysRemaining: 365,
            planType: "Annual",
            endDate: "2025-12-31"
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profile, isDemo, isAdmin, navigate]);

  const generateQRCode = async (pet: Pet) => {
    try {
      setQrLoading(prev => ({ ...prev, [pet.id]: true }));
      
      const { qrCode } = await petService.generateQRCode(pet.id, pet.username);
      setQrCodes(prev => ({ ...prev, [pet.username]: qrCode }));
      
      // Update pet in state
      setPets(prev => prev.map(p => p.id === pet.id ? { ...p, qr_code_generated: true, qr_code_url: qrCode } : p));
      
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setQrLoading(prev => ({ ...prev, [pet.id]: false }));
    }
  };

  const downloadQRCode = (petUsername: string, petName: string) => {
    const qrDataUrl = qrCodes[petUsername];
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `${petName}_QR_Code.png`;
      link.click();
    }
  };

  const copyProfileLink = (petUsername: string) => {
    const profileUrl = `http://192.168.1.40:8081/pet/${petUsername}`;
    navigator.clipboard.writeText(profileUrl);
    // You could add a toast notification here
    alert('Profile link copied to clipboard!');
  };

  const viewPetProfile = (petUsername: string) => {
    const profileUrl = `http://192.168.1.40:8081/pet/${petUsername}`;
    window.open(profileUrl, '_blank');
  };

  const QRCodeModal = ({ pet }: { pet: Pet }) => {
    const qrCode = qrCodes[pet.username] || pet.qr_code_url;
    const profileUrl = `${window.location.origin}/pet/${pet.username}`;

    return (
      <Dialog>
        <DialogTrigger asChild>
                                  <Button 
                          size="sm" 
                          onClick={() => !qrCode && generateQRCode(pet)}
                          disabled={qrLoading[pet.id]}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {qrLoading[pet.id] ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <QrCode className="w-4 h-4 mr-2" />
                          )}
                          {qrLoading[pet.id] ? 'Generating...' : qrCode ? 'View QR' : 'Generate QR'}
                        </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">QR Code for {pet.name}</DialogTitle>
            <DialogDescription className="text-center">
              Scan this QR code to view {pet.name}'s profile
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            {qrCode ? (
              <>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img src={qrCode} alt={`QR Code for ${pet.name}`} className="w-48 h-48" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Profile URL:</p>
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    {profileUrl}
                  </code>
                </div>
                <div className="flex space-x-2 w-full">
                  <Button 
                    onClick={() => downloadQRCode(pet.username, pet.name)}
                    className="flex-1"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    onClick={() => copyProfileLink(pet.username)}
                    className="flex-1"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
                <Button 
                  onClick={() => window.open(profileUrl, '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Profile Link
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <Button 
                  onClick={() => generateQRCode(pet)}
                  disabled={qrLoading[pet.id]}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {qrLoading[pet.id] ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate QR Code'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
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
              {profile?.name} {isDemo ? "(Demo)" : ""}
            </span>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600"
              onClick={logout}
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
              {!subscriptionStatus.isActive && (
                <Badge variant="destructive">Inactive</Badge>
              )}
              {subscriptionStatus.isActive && (
                <Badge variant="default" className="bg-green-600">Active</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!subscriptionStatus.isActive ? (
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
                  Active - {subscriptionStatus.daysRemaining} days remaining
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
                        <QRCodeModal pet={pet} />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-300"
                          onClick={() => viewPetProfile(pet.username)}
                        >
                          View Profile
                        </Button>
                        <Link to={`/dashboard/edit-pet/${pet.id}`}>
                          <Button size="sm" variant="outline" className="border-gray-300">
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
                    <span className="font-semibold text-gray-900">{pets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">QR Codes Generated</span>
                    <span className="font-semibold text-gray-900">{pets.filter(p => p.qr_code_generated).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Scans</span>
                    <span className="font-semibold text-gray-900">{pets.reduce((total, pet) => total + pet.total_scans, 0)}</span>
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
