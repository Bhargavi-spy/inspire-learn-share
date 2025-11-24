import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { LogOut, Menu, Coins, Video, Radio, Trash2, Calendar, Upload, User, PlaySquare } from "lucide-react";
import ChatbotAssistant from "@/components/ChatbotAssistant";
import GoogleTranslate from "@/components/GoogleTranslate";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

// Validation schemas
const videoSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  videoUrl: z.string().optional(),
});

const liveSessionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  youtubeLiveUrl: z.string().url("Must be a valid URL").refine(
    url => url.includes('youtube.com') || url.includes('youtu.be'),
    { message: "Must be a YouTube URL" }
  ),
});

export default function SeniorPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitationResponses, setInvitationResponses] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  
  // Video form
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Live session form
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDescription, setLiveDescription] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  useEffect(() => {
    checkAuth();
    fetchData();
    
    // Subscribe to real-time updates
    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          if (payload.new.id === profile?.id) {
            setProfile((prev: any) => ({ ...prev, coins: payload.new.coins }));
          }
        }
      )
      .subscribe();

    const invitationsChannel = supabase
      .channel('senior-invitations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitations'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const responsesChannel = supabase
      .channel('senior-responses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitation_responses'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(invitationsChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, []);

  const checkAuth = async () => {
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
  };

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch videos
    const { data: videosData } = await supabase
      .from("videos")
      .select("*")
      .eq("senior_id", user.id)
      .order("created_at", { ascending: false });
    setVideos(videosData || []);

    // Fetch invitations
    const { data: invitationsData } = await supabase
      .from("invitations")
      .select("*, profiles!invitations_school_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    setInvitations(invitationsData || []);

    // Fetch invitation responses
    const { data: responsesData } = await supabase
      .from("invitation_responses")
      .select("*")
      .eq("senior_id", user.id);
    setInvitationResponses(responsesData || []);

    // Fetch live sessions
    const { data: liveData } = await supabase
      .from("live_sessions")
      .select("*")
      .eq("senior_id", user.id)
      .order("started_at", { ascending: false });
    setLiveSessions(liveData || []);
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoTitle) {
      toast.error("Please provide a title");
      return;
    }

    if (!videoFile && !videoUrl) {
      toast.error("Please provide either a video file or YouTube URL");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let finalVideoUrl = videoUrl;

      // If video file is selected, upload to storage
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, videoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);

        finalVideoUrl = publicUrl;
        setUploadProgress(100);
      }

      // Validate input data
      const validatedData = videoSchema.parse({
        title: videoTitle,
        description: videoDescription || undefined,
        videoUrl: finalVideoUrl,
      });

      const { error } = await supabase.from("videos").insert({
        senior_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        video_url: validatedData.videoUrl,
      });

      if (error) throw error;

      toast.success("Video uploaded successfully!");
      setVideoTitle("");
      setVideoDescription("");
      setVideoUrl("");
      setVideoFile(null);
      setUploadProgress(0);
      fetchData();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Error uploading video");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Video deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error deleting video");
    }
  };

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!liveTitle || !liveUrl) {
      toast.error("Please provide title and YouTube Live URL");
      return;
    }

    setLoading(true);

    try {
      // Validate input data
      const validatedData = liveSessionSchema.parse({
        title: liveTitle,
        description: liveDescription || undefined,
        youtubeLiveUrl: liveUrl,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("live_sessions").insert({
        senior_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        youtube_live_url: validatedData.youtubeLiveUrl,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Live session started!");
      setLiveTitle("");
      setLiveDescription("");
      setLiveUrl("");
      fetchData();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Error starting live session");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStopLive = async (id: string) => {
    try {
      const { error } = await supabase
        .from("live_sessions")
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Live session ended");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error stopping live session");
    }
  };

  const handleInvitationResponse = async (invitationId: string, status: "accepted" | "rejected") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingResponse = invitationResponses.find(r => r.invitation_id === invitationId);

    if (existingResponse) {
      const { error } = await supabase
        .from("invitation_responses")
        .update({ status, responded_at: new Date().toISOString() })
        .eq("id", existingResponse.id);

      if (error) {
        toast.error("Error updating response");
      } else {
        toast.success(`Invitation ${status}`);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("invitation_responses")
        .insert({ invitation_id: invitationId, senior_id: user.id, status });

      if (error) {
        toast.error("Error responding to invitation");
      } else {
        toast.success(`Invitation ${status}`);
        fetchData();
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <nav className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/senior/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/senior/browse-videos")}
                  >
                    <PlaySquare className="mr-2 h-4 w-4" />
                    Browse Videos
                  </Button>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-semibold text-sm text-muted-foreground">My Invitations</h3>
                    {invitations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No invitations yet</p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {invitations.map((inv) => {
                          const response = invitationResponses.find(r => r.invitation_id === inv.id);
                          return (
                            <Card key={inv.id} className="p-3">
                              <h4 className="font-semibold text-sm">{inv.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                From: {inv.profiles?.full_name}
                              </p>
                              {inv.event_date && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(inv.event_date).toLocaleString()}
                                </p>
                              )}
                              {response ? (
                                <div className={`text-xs font-medium mt-2 ${response.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                                  {response.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                                </div>
                              ) : (
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-7 text-xs"
                                    onClick={() => handleInvitationResponse(inv.id, 'accepted')}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 text-xs"
                                    onClick={() => handleInvitationResponse(inv.id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div>
              <h1 className="text-2xl font-bold text-primary">Senior Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome, {profile.full_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <GoogleTranslate />
            <ThemeToggle />
            <Badge variant="secondary" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {profile.coins} Coins
            </Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Upload Video */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Video
              </CardTitle>
              <CardDescription>Share your knowledge with students</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadVideo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoTitle">Video Title</Label>
                  <Input
                    id="videoTitle"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g., Introduction to Organic Farming"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoDescription">Description</Label>
                  <Textarea
                    id="videoDescription"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Describe your video..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoFile">Upload Video File</Label>
                  <Input
                    id="videoFile"
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoFile(file);
                        setVideoUrl(""); // Clear URL if file is selected
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Or provide a YouTube URL below</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">YouTube URL (Optional)</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setVideoFile(null); // Clear file if URL is provided
                    }}
                    placeholder="https://youtube.com/watch?v=..."
                    disabled={!!videoFile}
                  />
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Uploading..." : "Upload Video"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Start Live Session */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Start Live Session
              </CardTitle>
              <CardDescription>Go live with YouTube</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartLive} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="liveTitle">Session Title</Label>
                  <Input
                    id="liveTitle"
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    placeholder="e.g., Q&A on Traditional Crafts"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liveDescription">Description</Label>
                  <Textarea
                    id="liveDescription"
                    value={liveDescription}
                    onChange={(e) => setLiveDescription(e.target.value)}
                    placeholder="Describe your live session..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liveUrl">YouTube Live URL</Label>
                  <Input
                    id="liveUrl"
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Starting..." : "Start Live Session"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Active Live Sessions */}
        {liveSessions.filter(s => s.is_active).length > 0 && (
          <Card className="shadow-elevated mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-destructive animate-pulse" />
                Active Live Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveSessions.filter(s => s.is_active).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <h3 className="font-semibold">{session.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Started {new Date(session.started_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleStopLive(session.id)}
                    >
                      Stop Live
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Videos */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              My Videos
            </CardTitle>
            <CardDescription>
              {videos.length} video{videos.length !== 1 ? "s" : ""} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videos.length === 0 ? (
                <p className="text-center text-muted-foreground col-span-full py-8">
                  No videos yet. Upload your first one!
                </p>
              ) : (
                videos.map((video) => (
                  <div key={video.id} className="rounded-lg border bg-card overflow-hidden hover:shadow-soft transition-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {video.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          👍 {video.likes} likes
                        </span>
                        <span>{video.watch_time_minutes} min watched</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ChatbotAssistant />
    </div>
  );
}
