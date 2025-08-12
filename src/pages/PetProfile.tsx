import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Phone, MessageCircle, Instagram, Download, Home, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { petService } from "@/lib/pets";
import type { Pet } from "@/lib/supabase";
import { toast } from "sonner";

const PetProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);

  // Load pet data from database
  useEffect(() => {
    const loadPetData = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const petData = await petService.getPetByUsername(username);
        setPet(petData);

        // Record the QR scan
        const scanData: {
          scanner_ip?: string;
          scanner_user_agent?: string;
          scanner_country?: string;
          scanner_city?: string;
          scanner_location_lat?: number;
          scanner_location_lng?: number;
        } = {
          scanner_ip: '',
          scanner_user_agent: navigator.userAgent,
          scanner_country: '',
          scanner_city: ''
        };

        // Try to get location for more accurate tracking
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              scanData.scanner_location_lat = position.coords.latitude;
              scanData.scanner_location_lng = position.coords.longitude;
              await petService.recordQRScan(petData.id, scanData);
            },
            async () => {
              // Even if location fails, record the scan
              await petService.recordQRScan(petData.id, scanData);
            }
          );
        } else {
          await petService.recordQRScan(petData.id, scanData);
        }
      } catch (error: any) {
        console.error('Failed to load pet data:', error);
        
        if (error.message === 'User account is inactive') {
          toast.error('This pet\'s owner account is inactive');
        } else if (error.message === 'User subscription has expired') {
          toast.error('This pet\'s owner subscription has expired');
        } else {
          toast.error('Pet not found');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPetData();
  }, [username]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationAccuracy(position.coords.accuracy);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please enable location services.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const shareLocationViaWhatsApp = async () => {
    // Updated: Use pet.whatsapp instead of pet.users.whatsapp
    if (!pet?.whatsapp) {
      toast.error('WhatsApp contact not available');
      return;
    }

    setScanLoading(true);
    
    if (location) {
      try {
        const message = `Found ${pet.name}! 🐾📍 Here's my location: https://maps.google.com/?q=${location.lat},${location.lng}`;
        // Updated: Use pet.whatsapp instead of pet.users.whatsapp
        const whatsappUrl = `https://wa.me/${pet.whatsapp.replace(/\s+/g, '').replace('+', '')}?text=${encodeURIComponent(message)}`;
        
        // Record WhatsApp share in database
        // Note: We'd need to track the scan ID for this, simplified for now
        
        window.open(whatsappUrl, '_blank');
        toast.success('WhatsApp message opened!');
      } catch (error) {
        console.error('Error sharing location:', error);
        toast.error('Failed to share location');
      }
    } else {
      getCurrentLocation();
    }
    
    setScanLoading(false);
  };

  const downloadContact = () => {
    if (!pet?.users) {
      toast.error('Contact information not available');
      return;
    }

    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${pet.users.name}
TEL:${pet.users.phone || ''}
END:VCARD`;
    
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pet.users.name.replace(/\s+/g, '_')}.vcf`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Contact downloaded!');
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Loading Pet Profile</h1>
          <p className="text-gray-600">Please wait while we fetch the pet information...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Pet Profile Unavailable</h1>
          <p className="text-gray-600 text-lg">
            This pet profile is currently unavailable. This may be because:
          </p>
          <ul className="text-gray-600 text-left mt-4 space-y-2">
            <li>• The pet profile doesn't exist</li>
            <li>• The owner's account is inactive</li>
            <li>• The owner's subscription has expired</li>
          </ul>
          <p className="text-gray-500 text-sm mt-4">
            If you found this pet, please contact WhiteTag support for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WhiteTag</h1>
            </div>
          </div>
        </div>

        {/* Pet Profile Card */}
        <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardContent className="p-0">
            {/* Pet Image */}
            <div className="relative">
              <img
                src={pet.photo_url || "/placeholder.svg"}
                alt={pet.name}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{pet.name}</h1>
                <div className="flex space-x-2">
                  <Badge className="bg-white/90 text-gray-900 font-medium border-0">
                    {pet.type}
                  </Badge>
                  {pet.breed && (
                    <Badge className="bg-white/20 text-white border border-white/30 font-medium">
                      {pet.breed}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Pet Details */}
            <div className="p-6 space-y-5">
              {pet.age && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Age</span>
                  <span className="text-gray-900 font-semibold">{pet.age}</span>
                </div>
              )}

              {pet.color && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Appearance</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">{pet.color}</p>
                </div>
              )}

              {pet.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">{pet.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

       {/* Emergency Contact */}
       <div className="relative overflow-hidden rounded-3xl p-6 mb-6 group">
  {/* Dynamic gradient background that shifts */}
  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 via-blue-600/80 to-cyan-500/70 opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
  
  {/* Glassmorphism overlay */}
  <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
  
  {/* Animated floating elements */}
  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-pink-400/40 to-purple-600/40 rounded-full blur-2xl animate-pulse"></div>
  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-yellow-400/30 to-orange-500/30 rounded-full blur-xl animate-bounce" style={{animationDuration: '3s'}}></div>
  
  {/* Subtle grid pattern */}
  <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>

  <div className="relative z-10">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
          Found {pet.name}?
        </h3>
        <p className="text-white/90 text-sm font-medium drop-shadow">
          Share your location instantly!
        </p>
      </div>
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
        <MapPin className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
    </div>

    <Button
      onClick={shareLocationViaWhatsApp}
      disabled={scanLoading}
      className="w-full h-14 bg-white/95 hover:bg-white text-gray-900 font-bold text-lg rounded-2xl shadow-xl border-0 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
    >
      {scanLoading ? (
        <>
          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
          Getting Location...
        </>
      ) : (
        <>
          <MessageCircle className="w-6 h-6 mr-3 text-green-600" />
          Share
        </>
      )}
    </Button>

    {location && locationAccuracy && (
      <p className="text-white/80 text-xs mt-3 text-center drop-shadow">
        📍 Location accuracy: ±{Math.round(locationAccuracy)}m
      </p>
    )}
  </div>
</div>

        {/* Contact Owner Card */}
        <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardContent className="p-6">
            {/* Owner Avatar & Info */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-white">
                  {pet.users?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Contact Owner</h3>
              <p className="text-gray-600 text-sm">{pet.users?.name}</p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-3 mb-6">
              {pet.show_phone && pet.users?.phone && (
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 hover:bg-gray-50 text-gray-900 font-medium rounded-lg group"
                  onClick={() => window.open(`tel:${pet.users.phone}`)}
                >
                  <Phone className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="flex-1 text-left">Call Now</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              {/* Updated: Use pet.whatsapp instead of pet.users.whatsapp */}
              {pet.show_whatsapp && pet.whatsapp && (
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 hover:bg-gray-50 text-gray-900 font-medium rounded-lg group"
                  onClick={() => window.open(`https://wa.me/${pet.whatsapp?.replace(/\s+/g, '').replace('+', '')}`)}
                >
                  <MessageCircle className="w-5 h-5 mr-3 text-green-600" />
                  <span className="flex-1 text-left">WhatsApp</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              {/* Updated: Use pet.instagram instead of pet.users.instagram */}
              {pet.show_instagram && pet.instagram && (
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 hover:bg-gray-50 text-gray-900 font-medium rounded-lg group"
                  onClick={() => window.open(`https://instagram.com/${pet.instagram.replace('@', '')}`)}
                >
                  <Instagram className="w-5 h-5 mr-3 text-pink-600" />
                  <span className="flex-1 text-left">Instagram</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              <Button
                onClick={downloadContact}
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 hover:bg-gray-50 text-gray-900 font-medium rounded-lg group"
              >
                <Download className="w-5 h-5 mr-3 text-gray-600" />
                <span className="flex-1 text-left">Save Contact</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Address - Updated: Use pet.address instead of pet.users.address */}
            {pet.show_address && pet.address && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1 text-sm">Address</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{pet.address}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-gray-500 text-xs">
            Powered by <span className="font-medium">WhiteTag</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetProfile;