import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Video, Radio, Heart, Clock, ExternalLink } from "lucide-react";

export default function StudentPortal() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuth();
    fetchData();
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
      .eq("role", "student")
      .single();

    if (!profileData || !userRole) {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }

    setProfile(profileData);

    // Fetch liked videos
    const { data: likesData } = await supabase
      .from("video_likes")
      .select("video_id")
      .eq("student_id", user.id);

    if (likesData) {
      setLikedVideos(new Set(likesData.map(like => like.video_id)));
    }
  };

  const fetchData = async () => {
    // Fetch all videos with senior info
    const { data: videosData } = await supabase
      .from("videos")
      .select("*, profiles!videos_senior_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    setVideos(videosData || []);

    // Fetch active live sessions
    const { data: liveData } = await supabase
      .from("live_sessions")
      .select("*, profiles!live_sessions_senior_id_fkey(full_name)")
      .eq("is_active", true)
      .order("started_at", { ascending: false });
    setLiveSessions(liveData || []);
  };

  const handleToggleLike = async (videoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isLiked = likedVideos.has(videoId);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("video_likes")
          .delete()
          .eq("video_id", videoId)
          .eq("student_id", user.id);

        if (error) throw error;

        setLikedVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
        toast.success("Like removed");
      } else {
        // Like
        const { error } = await supabase
          .from("video_likes")
          .insert({
            video_id: videoId,
            student_id: user.id,
          });

        if (error) throw error;

        setLikedVideos(prev => new Set(prev).add(videoId));
        toast.success("Video liked!");
      }

      // Refresh videos to get updated like count
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error updating like");
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
          <div>
            <h1 className="text-2xl font-bold text-primary">Student Portal</h1>
            <p className="text-sm text-muted-foreground">Welcome, {profile.full_name}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Active Live Sessions */}
        {liveSessions.length > 0 && (
          <Card className="shadow-elevated border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-destructive animate-pulse" />
                Live Now
              </CardTitle>
              <CardDescription>
                Join live sessions from experienced seniors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {liveSessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden border-2 border-destructive/30">
                    <CardContent className="p-4">
                      <Badge variant="destructive" className="mb-2 animate-pulse">
                        LIVE
                      </Badge>
                      <h3 className="font-semibold mb-1">{session.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {session.profiles?.full_name}
                      </p>
                      {session.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {session.description}
                        </p>
                      )}
                      <Button 
                        className="w-full"
                        onClick={() => window.open(session.youtube_live_url, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Join Live Session
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Videos */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              All Videos
            </CardTitle>
            <CardDescription>
              Learn from experienced seniors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videos.length === 0 ? (
                <p className="text-center text-muted-foreground col-span-full py-8">
                  No videos available yet
                </p>
              ) : (
                videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-soft transition-shadow">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold mb-1 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {video.profiles?.full_name}
                        </p>
                      </div>
                      
                      {video.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {video.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {video.watch_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {video.likes} likes
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => window.open(video.video_url, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Watch Video
                        </Button>
                        <Button
                          variant={likedVideos.has(video.id) ? "default" : "outline"}
                          className="w-full"
                          onClick={() => handleToggleLike(video.id)}
                        >
                          <Heart className={`mr-2 h-4 w-4 ${likedVideos.has(video.id) ? 'fill-current' : ''}`} />
                          {likedVideos.has(video.id) ? "Liked" : "Like"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
