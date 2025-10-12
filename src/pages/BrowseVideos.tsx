import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Video, ThumbsUp, Eye } from "lucide-react";
import { toast } from "sonner";

export default function BrowseVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchVideos();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);
    fetchUserLikes(user.id);
  };

  const fetchVideos = async () => {
    const { data: videosData } = await supabase
      .from("videos")
      .select("*, profiles!videos_senior_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    
    setVideos(videosData || []);
  };

  const fetchUserLikes = async (userId: string) => {
    const { data: likesData } = await supabase
      .from("video_likes")
      .select("video_id")
      .eq("student_id", userId);
    
    if (likesData) {
      setUserLikes(new Set(likesData.map(like => like.video_id)));
    }
  };

  const handleLike = async (videoId: string) => {
    if (!currentUserId) return;

    if (userLikes.has(videoId)) {
      const { error } = await supabase
        .from("video_likes")
        .delete()
        .eq("video_id", videoId)
        .eq("student_id", currentUserId);

      if (error) {
        toast.error("Error removing like");
      } else {
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
        fetchVideos();
      }
    } else {
      const { error } = await supabase
        .from("video_likes")
        .insert({ video_id: videoId, student_id: currentUserId });

      if (error) {
        toast.error("Error adding like");
      } else {
        setUserLikes(prev => new Set(prev).add(videoId));
        fetchVideos();
      }
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
    return match ? match[1] : null;
  };

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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="shadow-elevated mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-6 w-6" />
              Browse Videos
            </CardTitle>
            <CardDescription>Watch videos shared by other seniors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.length === 0 ? (
                <p className="text-center text-muted-foreground col-span-full py-8">
                  No videos available yet
                </p>
              ) : (
                videos.map((video) => {
                  const youtubeId = extractYouTubeId(video.video_url);
                  return (
                    <div key={video.id} className="rounded-lg border bg-card overflow-hidden hover:shadow-soft transition-shadow">
                      {youtubeId && (
                        <div className="aspect-video">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          By: {video.profiles?.full_name || "Unknown"}
                        </p>
                        {video.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              {video.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {video.watch_time_minutes}m
                            </span>
                          </div>
                          <Button
                            variant={userLikes.has(video.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLike(video.id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {userLikes.has(video.id) ? "Liked" : "Like"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
