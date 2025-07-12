import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft, Save, Upload, User, Phone, Instagram, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { petService, uploadPetPhoto } from "@/lib/pets";
import type { Pet } from "@/lib/supabase";
import { toast } from "sonner";

const EditPet = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // State management
  const [originalPet, setOriginalPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Editable form state
  const [petData, setPetData] = useState<Partial<Pet>>({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    color: "",
    description: "",
    photo_url: "",
    username: ""
  });

  // Individual toggle states for better control
  const [showPhone, setShowPhone] = useState(true);
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const [showInstagram, setShowInstagram] = useState(true);
  const [showAddress, setShowAddress] = useState(true);

  // Load pet data from database
  useEffect(() => {
    const loadPetData = async () => {
      if (!petId || !profile) {
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const pet = await petService.getPetById(parseInt(petId));
        
        // Check if user owns this pet
        if (pet.user_id !== profile.id) {
          toast.error('You can only edit your own pets');
          navigate('/dashboard');
          return;
        }

        setOriginalPet(pet);
        setPetData({
          name: pet.name,
          type: pet.type,
          breed: pet.breed || "",
          age: pet.age || "",
          color: pet.color || "",
          description: pet.description || "",
          photo_url: pet.photo_url || "",
          username: pet.username
        });

        // Set individual toggle states
        setShowPhone(pet.show_phone);
        setShowWhatsApp(pet.show_whatsapp);
        setShowInstagram(pet.show_instagram);
        setShowAddress(pet.show_address);
      } catch (error) {
        console.error('Failed to load pet data:', error);
        toast.error('Failed to load pet data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadPetData();
  }, [petId, profile, navigate]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !petData.username) return;

    try {
      setUploadingPhoto(true);
      const photoUrl = await uploadPetPhoto(file, petData.username);
      setPetData(prev => ({ ...prev, photo_url: photoUrl }));
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!originalPet || !petData.name || !petData.username) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      // Merge the individual toggle states with the pet data
      const updates: Partial<Pet> = {
        name: petData.name,
        type: petData.type as any,
        breed: petData.breed,
        age: petData.age,
        color: petData.color,
        description: petData.description,
        photo_url: petData.photo_url,
        username: petData.username,
        show_phone: showPhone,
        show_whatsapp: showWhatsApp,
        show_instagram: showInstagram,
        show_address: showAddress
      };
      
      await petService.updatePet(originalPet.id, updates);
      toast.success("Pet information updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Failed to save pet data:', error);
      toast.error(error.message || 'Failed to save pet information');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPetData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Remove the handleOwnerChange function as it's not needed anymore

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Loading Pet Data</h1>
          <p className="text-gray-600">Please wait while we fetch the pet information...</p>
        </div>
      </div>
    );
  }

  if (!originalPet) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Pet Not Found</h1>
          <p className="text-gray-600 text-lg">The pet you're trying to edit doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Edit Pet</span>
          </div>
        </div>

        <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardContent className="p-0">
            {/* Pet Image Section */}
            <div className="relative">
              <img
                src={petData.photo_url || "/placeholder.svg"}
                alt={petData.name || "Pet"}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{petData.name}</h1>
                <Badge className="bg-white/90 text-gray-900 font-medium border-0">
                  {petData.type}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploadingPhoto}
                />
                <label htmlFor="photo-upload">
                  <Button 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 cursor-pointer"
                    disabled={uploadingPhoto}
                    asChild
                  >
                    <span>
                      {uploadingPhoto ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-6">
              {/* Basic Pet Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Pet Name</Label>
                    <Input
                      id="name"
                      value={petData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="mt-1"
                      placeholder="Enter pet name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type</Label>
                    <Input
                      id="type"
                      value={petData.type}
                      onChange={(e) => handleInputChange("type", e.target.value)}
                      className="mt-1"
                      placeholder="e.g., Dog, Cat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="breed" className="text-sm font-medium text-gray-700">Breed</Label>
                    <Input
                      id="breed"
                      value={petData.breed}
                      onChange={(e) => handleInputChange("breed", e.target.value)}
                      className="mt-1"
                      placeholder="Enter breed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age</Label>
                    <Input
                      id="age"
                      value={petData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="mt-1"
                      placeholder="e.g., 3 years"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="color" className="text-sm font-medium text-gray-700">Color/Markings</Label>
                    <Input
                      id="color"
                      value={petData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      className="mt-1"
                      placeholder="Describe pet's color and markings"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="description"
                      value={petData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Describe your pet's personality, habits, and any distinctive features"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Profile Username</Label>
                    <Input
                      id="username"
                      value={petData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="mt-1"
                      placeholder="unique_pet_name"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be part of your pet's profile URL</p>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                <p className="text-sm text-gray-600 mb-4">Choose what information to show publicly when someone scans your pet's QR code</p>
                
                {/* Contact Information Note */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-900">Contact Information</h4>
                  </div>
                  <p className="text-sm text-blue-800 mt-1">
                    Your contact information (name, phone, WhatsApp, Instagram, address) is managed in your profile settings. 
                    The privacy settings below control what information is shown when someone scans your pet's QR code.
                  </p>
                </div>
                
                {/* Debug info - remove this later */}
                <div className="mb-4 p-2 bg-blue-50 rounded text-xs text-blue-800">
                  <strong>Current Settings:</strong> 
                  Phone: {showPhone ? "✓" : "✗"}, 
                  WhatsApp: {showWhatsApp ? "✓" : "✗"}, 
                  Instagram: {showInstagram ? "✓" : "✗"}, 
                  Address: {showAddress ? "✓" : "✗"}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Show Phone Number</p>
                        <p className="text-sm text-gray-600">Allow people to call you directly</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={showPhone ? "default" : "outline"}
                      onClick={() => {
                        const newValue = !showPhone;
                        console.log("Phone toggle clicked:", newValue);
                        setShowPhone(newValue);
                      }}
                      className={`w-16 ${showPhone ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300'}`}
                    >
                      {showPhone ? "ON" : "OFF"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Show WhatsApp</p>
                        <p className="text-sm text-gray-600">Allow WhatsApp messaging</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={showWhatsApp ? "default" : "outline"}
                      onClick={() => {
                        const newValue = !showWhatsApp;
                        console.log("WhatsApp toggle clicked:", newValue);
                        setShowWhatsApp(newValue);
                      }}
                      className={`w-16 ${showWhatsApp ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300'}`}
                    >
                      {showWhatsApp ? "ON" : "OFF"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Instagram className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Show Instagram</p>
                        <p className="text-sm text-gray-600">Display your Instagram handle</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={showInstagram ? "default" : "outline"}
                      onClick={() => {
                        const newValue = !showInstagram;
                        console.log("Instagram toggle clicked:", newValue);
                        setShowInstagram(newValue);
                      }}
                      className={`w-16 ${showInstagram ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300'}`}
                    >
                      {showInstagram ? "ON" : "OFF"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">Show Address</p>
                        <p className="text-sm text-gray-600">Display your full address</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={showAddress ? "default" : "outline"}
                      onClick={() => {
                        const newValue = !showAddress;
                        console.log("Address toggle clicked:", newValue);
                        setShowAddress(newValue);
                      }}
                      className={`w-16 ${showAddress ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300'}`}
                    >
                      {showAddress ? "ON" : "OFF"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  disabled={saving}
                  className="flex-1 border-gray-300 disabled:opacity-50"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPet; 