import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, Save, Edit2, Camera } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  age: z.number().int().min(1).max(120),
  mobile_number: z.string().trim().min(1, "Phone number is required"),
  email: z.string().email(),
  description: z.string().max(500).optional(),
  interests: z.array(z.string()).optional(),
});

export default function SeniorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [interests, setInterests] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Check role from user_roles table (not from profiles)
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "senior")
      .single();

    if (!profileData || !userRole) {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }

    setProfile(profileData);
    setFullName(profileData.full_name || "");
    setAge(profileData.age?.toString() || "");
    setMobileNumber(profileData.mobile_number || "");
    setEmail(profileData.email || "");
    setDescription(profileData.description || "");
    setInterests(profileData.interests?.join(", ") || "");
    setProfileImage(profileData.profile_image || "");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfileImage(publicUrl);
      toast.success("Profile photo updated!");
    } catch (error: any) {
      toast.error(error.message || "Error uploading photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = profileSchema.parse({
        full_name: fullName,
        age: parseInt(age),
        mobile_number: mobileNumber,
        email: email,
        description: description || undefined,
        interests: interests ? interests.split(",").map(i => i.trim()).filter(Boolean) : [],
      });

      const interestsArray = validatedData.interests?.map(i => i as any) || [];

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: validatedData.full_name,
          age: validatedData.age,
          mobile_number: validatedData.mobile_number,
          email: validatedData.email,
          description: validatedData.description,
          interests: interestsArray,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Error updating profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <nav className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/senior")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-elevated">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-end mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profileImage} alt={fullName} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                  <Camera className="h-4 w-4" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              
              <div>
                <CardTitle className="text-2xl">{fullName}</CardTitle>
                <CardDescription className="text-base mt-1">@{email.split('@')[0]}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Phone Number</Label>
                  <Input
                    id="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g., Gardening, Cooking, Reading"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About Me</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length}/500 characters
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-muted-foreground">Name</span>
                  <span className="text-foreground">{fullName}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-muted-foreground">Age</span>
                  <span className="text-foreground">{age} years</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-muted-foreground">Email</span>
                  <span className="text-foreground">{email}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-muted-foreground">Phone</span>
                  <span className="text-foreground">{mobileNumber}</span>
                </div>

                {interests && (
                  <div className="flex justify-between items-start py-3 border-b">
                    <span className="font-medium text-muted-foreground">Interests</span>
                    <span className="text-foreground text-right flex-1 ml-4">{interests}</span>
                  </div>
                )}

                {description && (
                  <div className="py-3">
                    <span className="font-medium text-muted-foreground block mb-2">About Me</span>
                    <p className="text-foreground leading-relaxed">{description}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
