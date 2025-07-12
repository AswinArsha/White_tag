
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { petService, uploadPetPhoto } from "@/lib/pets";

const AddPet = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    color: "",
    description: "",
    photo_url: "",
    showPhone: true,
    showWhatsApp: true,
    showInstagram: false,
    showAddress: false
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Generate a temporary username for upload (will be replaced with actual username later)
    const tempUsername = `temp_${Date.now()}`;

    try {
      setUploadingPhoto(true);
      const photoUrl = await uploadPetPhoto(file, tempUsername);
      setFormData({ ...formData, photo_url: photoUrl });
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const generateUsername = (petName: string) => {
    // Generate a username from pet name
    const baseUsername = petName.toLowerCase()
      .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric with underscore
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .substring(0, 20); // Limit length
    
    // Add random suffix to make it unique
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${baseUsername}_${suffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error("Please login to add pets");
      navigate("/login");
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.type) {
      toast.error("Please fill in pet name and type");
      return;
    }

    setSubmitting(true);

    try {
      // Generate unique username
      const username = generateUsername(formData.name);

      // Prepare pet data
      const petData = {
        name: formData.name,
        username: username,
        type: formData.type as 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other',
        breed: formData.breed || undefined,
        age: formData.age || undefined,
        color: formData.color || undefined,
        description: formData.description || undefined,
        photo_url: formData.photo_url || undefined,
        show_phone: formData.showPhone,
        show_whatsapp: formData.showWhatsApp,
        show_instagram: formData.showInstagram,
        show_address: formData.showAddress
      };

      console.log("Creating pet:", petData);

      // Create the pet
      await petService.createPet(profile.id, petData);

      toast.success(`${formData.name} has been added successfully!`);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Failed to create pet:", error);
      toast.error(error.message || "Failed to add pet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} disabled={submitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-primary">WhiteTag</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Pet 🐾</h1>
          <p className="text-muted-foreground">Create a digital profile for your furry friend</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pet Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Pet Photo</CardTitle>
              <CardDescription>Upload a clear photo of your pet</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.photo_url ? (
                <div className="space-y-4">
                  <img
                    src={formData.photo_url}
                    alt="Pet preview"
                    className="w-40 h-40 object-cover rounded-lg border mx-auto"
                  />
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload-replace"
                      disabled={uploadingPhoto || submitting}
                    />
                    <label htmlFor="photo-upload-replace">
                      <Button type="button" variant="outline" disabled={uploadingPhoto || submitting} asChild>
                        <span className="cursor-pointer">
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
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploadingPhoto || submitting}
                  />
                  <label htmlFor="photo-upload">
                    <Button type="button" variant="outline" disabled={uploadingPhoto || submitting} asChild>
                      <span className="cursor-pointer">
                        {uploadingPhoto ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pet Details */}
          <Card>
            <CardHeader>
              <CardTitle>Pet Details</CardTitle>
              <CardDescription>Basic information about your pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Pet Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Fluffy"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Pet Type *</Label>
                  <Select onValueChange={(value) => handleChange("type", value)} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                      <SelectItem value="Bird">Bird</SelectItem>
                      <SelectItem value="Rabbit">Rabbit</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => handleChange("breed", e.target.value)}
                    placeholder="e.g., Golden Retriever"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="e.g., 2 years"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="color">Color/Markings</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="e.g., Brown with white patches"
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Any special characteristics, behavior, or medical conditions..."
                  rows={3}
                  disabled={submitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Choose what contact information to show publicly when someone scans your pet's QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPhone"
                    checked={formData.showPhone}
                    onCheckedChange={(checked) => handleChange("showPhone", checked)}
                    disabled={submitting}
                  />
                  <Label htmlFor="showPhone" className="text-sm">Show your phone number publicly</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showWhatsApp"
                    checked={formData.showWhatsApp}
                    onCheckedChange={(checked) => handleChange("showWhatsApp", checked)}
                    disabled={submitting}
                  />
                  <Label htmlFor="showWhatsApp" className="text-sm">Show your WhatsApp number publicly</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showInstagram"
                    checked={formData.showInstagram}
                    onCheckedChange={(checked) => handleChange("showInstagram", checked)}
                    disabled={submitting}
                  />
                  <Label htmlFor="showInstagram" className="text-sm">Show your Instagram handle publicly</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showAddress"
                    checked={formData.showAddress}
                    onCheckedChange={(checked) => handleChange("showAddress", checked)}
                    disabled={submitting}
                  />
                  <Label htmlFor="showAddress" className="text-sm">Show your address publicly</Label>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your contact information will be taken from your profile settings. 
                  These privacy settings control what information is shown when someone scans your pet's QR code.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || uploadingPhoto}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Pet Profile...
                </>
              ) : (
                "Create Pet Profile"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPet;
