import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { School, Users, GraduationCap } from "lucide-react";
import { z } from "zod";

const INTERESTS = [
  "Art",
  "Farming", 
  "Organic Farming",
  "Education",
  "Crafts",
  "Stitching",
  "Storytelling",
  "Cooking",
  "Gardening"
];

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long"),
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  age: z.number().int().min(1, "Age must be at least 1").max(120, "Age must be realistic"),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number format"),
  role: z.enum(['school', 'senior', 'student']),
  schoolName: z.string().max(200, "School name too long").optional(),
  schoolEmail: z.string().email("Invalid email").max(255, "Email too long").optional(),
  interests: z.array(z.string()).optional(),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "student";
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState<"school" | "senior" | "student">(defaultRole as any);
  const [interests, setInterests] = useState<string[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [description, setDescription] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!fullName || !age || !mobileNumber || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (role === "senior" && interests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    setLoading(true);

    try {
      // Validate input data
      const validatedData = signUpSchema.parse({
        email,
        password,
        fullName,
        age: parseInt(age),
        mobileNumber,
        role,
        schoolName: role === 'school' ? schoolName : undefined,
        schoolEmail: role === 'school' ? schoolEmail : undefined,
        interests: role === 'senior' ? interests : undefined,
      });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Insert profile (without role - roles are stored separately)
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: validatedData.fullName,
          age: validatedData.age,
          mobile_number: validatedData.mobileNumber,
          email: validatedData.email,
          interests: validatedData.interests as any || [],
          school_name: validatedData.schoolName || null,
          school_email: validatedData.schoolEmail || null,
          description: description || null,
          theme_preference: 'light',
        });

        if (profileError) throw profileError;

        // Note: user_roles table is automatically populated by the sync_user_role trigger
        toast.success("Account created successfully!");
        navigate(role === "school" ? "/school" : role === "senior" ? "/senior" : "/student");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Error signing up");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input data
      const validatedData = signInSchema.parse({ email, password });

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Fetch role from user_roles table (not from profiles)
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id)
          .single();

        if (userRole) {
          toast.success("Signed in successfully!");
          navigate(userRole.role === "school" ? "/school" : userRole.role === "senior" ? "/senior" : "/student");
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Error signing in");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const getRoleIcon = () => {
    switch (role) {
      case "school": return <School className="h-6 w-6" />;
      case "senior": return <Users className="h-6 w-6" />;
      case "student": return <GraduationCap className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Button 
        onClick={() => navigate("/")}
        className="absolute top-4 left-4"
        variant="outline"
      >
        ← Back to Home
      </Button>
      <Card className="w-full max-w-lg shadow-elevated">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4 text-primary">
            {getRoleIcon()}
          </div>
          <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
          <CardDescription>
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(v) => setIsSignUp(v === "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <Select value={role} onValueChange={(v: any) => setRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                {role === "school" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Enter school name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schoolEmail">School Email</Label>
                      <Input
                        id="schoolEmail"
                        type="email"
                        value={schoolEmail}
                        onChange={(e) => setSchoolEmail(e.target.value)}
                        placeholder="Enter school email"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                    />
                  </div>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {role === "senior" && (
                  <>
                    <div className="space-y-2">
                      <Label>Interests</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {INTERESTS.map((interest) => (
                          <div key={interest} className="flex items-center space-x-2">
                            <Checkbox
                              id={interest}
                              checked={interests.includes(interest)}
                              onCheckedChange={() => toggleInterest(interest)}
                            />
                            <Label htmlFor={interest} className="text-sm cursor-pointer">
                              {interest}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">About Me (Optional)</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I accept the terms and conditions
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
