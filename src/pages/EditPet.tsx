import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft, Save, Upload, User, MessageCircle, Instagram, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { petService, uploadPetPhoto } from "@/lib/pets";
import { supabase } from "@/lib/supabase";
import type { Pet } from "@/lib/supabase";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';

// Form data interface that includes both pet and user contact fields
interface PetFormData {
  // Pet fields
  name: string;
  type: string;
  breed: string;
  age: string;
  color: string;
  description: string;
  photo_url: string;
  username: string;
  // User contact fields
  whatsapp: string;
  address: string;
  instagram: string;
}

const EditPet = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // State management
  const [originalPet, setOriginalPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Editable form state (using separate interface)
  const [petData, setPetData] = useState<PetFormData>({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    color: "",
    description: "",
    photo_url: "",
    username: "",
    // Contact information from user profile
    whatsapp: "",
    address: "",
    instagram: ""
  });

  // Individual toggle states for privacy settings (REMOVED showPhone as requested)
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const [showInstagram, setShowInstagram] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

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
          // Pet fields
          name: pet.name,
          type: pet.type,
          breed: pet.breed || "",
          age: pet.age || "",
          color: pet.color || "",
          description: pet.description || "",
          photo_url: pet.photo_url || "",
          username: pet.username,
          // Contact fields (now from pets table)
          whatsapp: pet.whatsapp || "",
          address: pet.address || "",
          instagram: pet.instagram || ""
        });

        // Set individual toggle states (REMOVED showPhone as requested)
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

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Maximum file size in MB
      maxWidthOrHeight: 1920, // Maximum width or height
      useWebWorker: true,
      initialQuality: 0.8
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log('Original file size:', file.size / 1024 / 1024, 'MB');
      console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original file if compression fails
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !petData.username) return;

    try {
      setUploadingPhoto(true);
      
      // Compress the image before uploading
      const compressedFile = await compressImage(file);
      
      const photoUrl = await uploadPetPhoto(compressedFile, petData.username);
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
    if (!originalPet || !petData.name || !petData.username || !profile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      // Update pet data including contact information (all in pets table now)
      const petUpdates: Partial<Pet> = {
        name: petData.name,
        type: petData.type as 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other',
        breed: petData.breed,
        age: petData.age,
        color: petData.color,
        description: petData.description,
        photo_url: petData.photo_url,
        username: petData.username,
        // Contact information (now stored in pets table)
        whatsapp: petData.whatsapp,
        instagram: petData.instagram,
        address: petData.address,
        // Privacy settings (REMOVED show_phone as requested)
        show_phone: false, // Always false since checkbox was removed
        show_whatsapp: showWhatsApp,
        show_instagram: showInstagram,
        show_address: showAddress
      };
      
      // Update pet table with all data
      await petService.updatePet(originalPet.id, petUpdates);

      toast.success("Pet information updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Failed to save pet data:', error);
      toast.error(error.message || 'Failed to save pet information');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PetFormData, value: string) => {
    setPetData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

              {/* Contact Information - AS REQUESTED */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      value={petData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      className="mt-1"
                      placeholder="e.g., +91 9876543210"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code for better connectivity</p>
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="text-sm font-medium text-gray-700">Instagram Handle</Label>
                    <Input
                      id="instagram"
                      value={petData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      className="mt-1"
                      placeholder="e.g., @petlover123"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include @ symbol if desired</p>
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                    <Textarea
                      id="address"
                      value={petData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Enter your full address..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This will help people return your pet if found</p>
                  </div>
                </div>
              </div>

              {/* Privacy Settings - REMOVED PHONE TOGGLE AS REQUESTED */}
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
                    The contact information you enter above will be saved for this specific pet.
                    These privacy settings control what information is shown when someone scans your pet's QR code.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Show WhatsApp Number</p>
                        <p className="text-sm text-gray-600">Allow people to contact you via WhatsApp</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={showWhatsApp ? "default" : "outline"}
                      onClick={() => setShowWhatsApp(!showWhatsApp)}
                      className="min-w-[60px]"
                    >
                      {showWhatsApp ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="font-medium text-gray-900">Show Instagram Handle</p>
                        <p className="text-sm text-gray-600">Share your Instagram profile</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={showInstagram ? "default" : "outline"}
                      onClick={() => setShowInstagram(!showInstagram)}
                      className="min-w-[60px]"
                    >
                      {showInstagram ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">Show Address</p>
                        <p className="text-sm text-gray-600">Display your address to help return your pet</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={showAddress ? "default" : "outline"}
                      onClick={() => setShowAddress(!showAddress)}
                      className="min-w-[60px]"
                    >
                      {showAddress ? "On" : "Off"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t pt-6 flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="min-w-[120px]"
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPet;