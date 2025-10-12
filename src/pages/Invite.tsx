import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Removed Select and Checkbox UI components for simplified form
import { Heart, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import { petService, uploadPetPhoto } from "@/lib/pets";
import imageCompression from "browser-image-compression";
import { inviteService } from "@/lib/invites";
import { supabase } from "@/lib/supabase";
import { fulfillmentService } from "@/lib/fulfillment";

// A simple two-step wizard that collects user registration then pet details.
const Invite = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [success, setSuccess] = useState(false);
  const lottieRef = useRef<HTMLDivElement | null>(null);
  const { token: tokenParam } = useParams();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => tokenParam || searchParams.get("token") || "", [tokenParam, searchParams]);
  const [inviteChecked, setInviteChecked] = useState(false);
  const [inviteValid, setInviteValid] = useState<boolean>(false);

  // Step 1: Registration data
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Step 2: Pet data
  const [petData, setPetData] = useState({
    name: "",
    type: "Dog", // default type since selector removed
    breed: "",
    age: "",
    color: "",
    description: "",
    photo_url: "",
    whatsapp: "",
    address: "",
    instagram: "",
    showWhatsApp: true,
    showInstagram: false,
    showAddress: false,
  });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePetChange = (field: string, value: string | boolean) => {
    setPetData((prev) => ({ ...prev, [field]: value }));
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 30,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
    } as const;
    try {
      const compressed = await imageCompression(file, options);
      return compressed;
    } catch {
      return file;
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const tempUsername = `temp_${Date.now()}`;
    try {
      setUploadingPhoto(true);
      const compressed = await compressImage(file);
      const photoUrl = await uploadPetPhoto(compressed, tempUsername);
      setPetData((prev) => ({ ...prev, photo_url: photoUrl }));
      toast.success("Photo uploaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Validate invite token on mount
  useEffect(() => {
    const run = async () => {
      if (!token) {
        setInviteChecked(true);
        setInviteValid(false);
        return;
      }
      try {
        const { valid } = await inviteService.validateInvite(token);
        setInviteValid(valid);
        if (!valid) {
          toast.error("This invite link has expired or is invalid.");
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to verify invite link");
        setInviteValid(false);
      } finally {
        setInviteChecked(true);
      }
    };
    run();
  }, [token]);

  const validateStep1 = () => {
    if (!userData.name || !userData.email || !userData.phone || !userData.password) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (userData.password !== userData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (userData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const generateUsername = (petName: string) => {
    const base = petName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .substring(0, 20);
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}_${suffix}`;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petData.name || !petData.type) {
      toast.error("Please fill in pet name and type");
      return;
    }
    setSubmitting(true);
    try {
      // Create user first
      const { profile } = await authService.register(userData.email, userData.password, {
        name: userData.name,
        phone: userData.phone,
      });

      const userId = (profile as any)?.id as number | undefined;
      if (!userId) throw new Error("User registration failed");

      // Create pet for new user
      const username = generateUsername(petData.name);
      const createdPet = await petService.createPet(userId, {
        name: petData.name,
        username,
        type: petData.type as any,
        breed: petData.breed || undefined,
        age: petData.age || undefined,
        color: petData.color || undefined,
        description: petData.description || undefined,
        photo_url: petData.photo_url || undefined,
        whatsapp: petData.whatsapp || undefined,
        instagram: petData.instagram || undefined,
        address: petData.address || undefined,
        show_whatsapp: !!petData.showWhatsApp,
        show_instagram: !!petData.showInstagram,
        show_address: !!petData.showAddress,
      });
      // Create fulfillment task entry (new signup)
      try {
        await fulfillmentService.createTask({
          user_id: userId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          pet_name: createdPet?.name,
          pet_username: createdPet?.username,
          stage: "new_signup",
        });
      } catch (ftErr) {
        console.warn("Failed to create fulfillment task:", ftErr);
      }

      // Consume invite token on success (mark as used)
      if (token) {
        try {
          await inviteService.consumeInvite(token, userId);
        } catch (consumeErr) {
          console.warn("Failed to consume invite token:", consumeErr);
        }
      }
      // send transactional email before showing confetti
      try {
        await supabase.functions.invoke("send-whitetag-email", {
          body: {
            email: userData.email,
            name: userData.name,
            petName: createdPet?.name,
            username: createdPet?.username,
          },
        });
        console.log("Welcome email sent!");
      } catch (mailErr) {
        console.warn("Failed to send welcome email:", mailErr);
      }

      // Success state with confetti
      setSuccess(true);
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 120, spread: 80, startVelocity: 45, origin: { y: 0.1 } });
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
      } catch (e) {
        console.warn("Confetti load failed", e);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to complete invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Load success lottie when success becomes true
  useEffect(() => {
    let anim: any;
    (async () => {
      if (!success || !lottieRef.current) return;
      try {
        const lottie = await import("lottie-web");
        anim = lottie.loadAnimation({
          container: lottieRef.current,
          renderer: "svg",
          loop: false,
          autoplay: true,
          path: "/greenTick.json",
        });
      } catch (e) {
        console.warn("Lottie load failed", e);
      }
    })();
    return () => {
      try { anim?.destroy?.(); } catch {}
    };
  }, [success]);

  // Success state UI
  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div ref={lottieRef} className="mx-auto w-38 h-38" />
            <CardTitle className="mt-0">You're all set!</CardTitle>
            <CardDescription>Your account and pet were created successfully.</CardDescription>
          </CardHeader>
     <CardContent className="text-center pt-0">
  <p className="text-sm text-muted-foreground">
    You can close this page. You’ll receive further updates and notifications at your provided email address.
  </p>
</CardContent>

        </Card>
      </div>
    );
  }

  // Loading or invalid states
  if (!inviteChecked) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifying Invite…</CardTitle>
            <CardDescription>Please wait while we check your link.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Loading…</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || !inviteValid) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invite Link Invalid</CardTitle>
            <CardDescription>This invite has expired or is not valid.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Please request a new invite from the administrator.</p>
              <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
          
            <span className="text-2xl font-bold text-primary">WhiteTag Invite</span>
          </div>
          <CardTitle>{step === 1 ? "Create Your Account" : "Add Your Pet"}</CardTitle>
          <CardDescription>
            {step === 1 ? "Enter your details to get started" : "Provide your pet's details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" type="text" placeholder="Your full name" value={userData.name} onChange={handleUserChange} required disabled={submitting} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" value={userData.email} onChange={handleUserChange} required disabled={submitting} />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" value={userData.phone} onChange={handleUserChange} required disabled={submitting} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••" value={userData.password} onChange={handleUserChange} required disabled={submitting} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••" value={userData.confirmPassword} onChange={handleUserChange} required disabled={submitting} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>Next</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div>
                <Label className="mb-2 block">Pet Photo</Label>
                {petData.photo_url ? (
                  <div className="relative">
                    <img src={petData.photo_url} alt="Pet" className="w-full h-64 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload-change" disabled={uploadingPhoto || submitting} />
                      <label htmlFor="photo-upload-change">
                        <Button type="button" variant="secondary" disabled={uploadingPhoto || submitting} asChild>
                          <span className="cursor-pointer">
                            {uploadingPhoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {uploadingPhoto ? "Uploading..." : "Change Photo"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Click to upload or drag and drop</p>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" disabled={uploadingPhoto || submitting} />
                    <label htmlFor="photo-upload">
                      <Button type="button" variant="outline" disabled={uploadingPhoto || submitting} asChild>
                        <span className="cursor-pointer">
                          {uploadingPhoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          {uploadingPhoto ? "Uploading..." : "Choose Photo"}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              {/* Pet Details */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pet-name">Pet Name *</Label>
                    <Input id="pet-name" value={petData.name} onChange={(e) => handlePetChange("name", e.target.value)} placeholder="e.g., Fluffy" required disabled={submitting} />
                  </div>
                  {/* Pet Type selector removed as requested; default is applied */}
                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Input id="breed" value={petData.breed} onChange={(e) => handlePetChange("breed", e.target.value)} placeholder="e.g., Golden Retriever" disabled={submitting} />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" value={petData.age} onChange={(e) => handlePetChange("age", e.target.value)} placeholder="e.g., 3 years" disabled={submitting} />
                  </div>
                  <div>
                    <Label htmlFor="color">Color/Markings</Label>
                    <Input id="color" value={petData.color} onChange={(e) => handlePetChange("color", e.target.value)} placeholder="e.g., Brown with white spots" disabled={submitting} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={petData.description} onChange={(e) => handlePetChange("description", e.target.value)} placeholder="Any special characteristics, behavior, or medical conditions..." rows={3} disabled={submitting} />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input id="whatsapp" value={petData.whatsapp} onChange={(e) => handlePetChange("whatsapp", e.target.value)} placeholder="e.g., +91 9876543210" disabled={submitting} />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input id="instagram" value={petData.instagram} onChange={(e) => handlePetChange("instagram", e.target.value)} placeholder="e.g., @petlover123" disabled={submitting} />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={petData.address} onChange={(e) => handlePetChange("address", e.target.value)} placeholder="Enter your full address..." rows={3} disabled={submitting} />
                </div>
              </div>

              {/* Privacy checkboxes removed as requested */}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={submitting}>Back</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Pet Profile "
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;
