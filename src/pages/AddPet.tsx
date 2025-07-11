
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, Heart } from "lucide-react";

const AddPet = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    color: "",
    description: "",
    ownerName: "",
    ownerPhone: "",
    ownerWhatsApp: "",
    ownerInstagram: "",
    ownerAddress: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding pet:", formData);
    // Handle pet creation logic here
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
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
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Click to upload or drag and drop</p>
                <Button type="button" variant="outline">
                  Choose Photo
                </Button>
              </div>
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
                  />
                </div>
                <div>
                  <Label htmlFor="type">Pet Type *</Label>
                  <Select onValueChange={(value) => handleChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="e.g., 2 years"
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
                />
              </div>
            </CardContent>
          </Card>

          {/* Owner Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Contact Information</CardTitle>
              <CardDescription>How people can reach you if they find your pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ownerName">Your Name *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleChange("ownerName", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerPhone">Phone Number *</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => handleChange("ownerPhone", e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="showPhone"
                      checked={formData.showPhone}
                      onCheckedChange={(checked) => handleChange("showPhone", checked)}
                    />
                    <Label htmlFor="showPhone" className="text-sm">Show phone number publicly</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="ownerWhatsApp">WhatsApp Number</Label>
                  <Input
                    id="ownerWhatsApp"
                    value={formData.ownerWhatsApp}
                    onChange={(e) => handleChange("ownerWhatsApp", e.target.value)}
                    placeholder="+91 9876543210"
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="showWhatsApp"
                      checked={formData.showWhatsApp}
                      onCheckedChange={(checked) => handleChange("showWhatsApp", checked)}
                    />
                    <Label htmlFor="showWhatsApp" className="text-sm">Show WhatsApp publicly</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="ownerInstagram">Instagram Handle</Label>
                <Input
                  id="ownerInstagram"
                  value={formData.ownerInstagram}
                  onChange={(e) => handleChange("ownerInstagram", e.target.value)}
                  placeholder="@your_handle"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="showInstagram"
                    checked={formData.showInstagram}
                    onCheckedChange={(checked) => handleChange("showInstagram", checked)}
                  />
                  <Label htmlFor="showInstagram" className="text-sm">Show Instagram publicly</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="ownerAddress">Address</Label>
                <Textarea
                  id="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={(e) => handleChange("ownerAddress", e.target.value)}
                  placeholder="Your home address"
                  rows={2}
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="showAddress"
                    checked={formData.showAddress}
                    onCheckedChange={(checked) => handleChange("showAddress", checked)}
                  />
                  <Label htmlFor="showAddress" className="text-sm">Show address publicly</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit">
              Create Pet Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPet;
