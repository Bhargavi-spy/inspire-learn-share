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
import { LogOut, Menu, Coins, Video, Radio, Trash2, Calendar, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SeniorPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  
  // Video form
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  // Live session form
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDescription, setLiveDescription] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  useEffect(() => {
    checkAuth();
    fetchData();
    
    // Subscribe to real-time coin updates
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
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

    if (!profileData || profileData.role !== "senior") {
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
    
    if (!videoTitle || !videoUrl) {
      toast.error("Please provide title and video URL");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("videos").insert({
        senior_id: user.id,
        title: videoTitle,
        description: videoDescription,
        video_url: videoUrl,
      });

      if (error) throw error;

      toast.success("Video uploaded successfully!");
      setVideoTitle("");
      setVideoDescription("");
      setVideoUrl("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error uploading video");
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("live_sessions").insert({
        senior_id: user.id,
        title: liveTitle,
        description: liveDescription,
        youtube_live_url: liveUrl,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Live session started!");
      setLiveTitle("");
      setLiveDescription("");
      setLiveUrl("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error starting live session");
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
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">My Invitations</h3>
                    {invitations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No invitations yet</p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {invitations.map((inv) => (
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
                          </Card>
                        ))}
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
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>

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
    </div>
  );
}
