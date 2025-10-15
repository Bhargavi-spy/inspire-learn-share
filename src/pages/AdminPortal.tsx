import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, LogOut, BarChart } from "lucide-react";

interface UserSession {
  id: string;
  user_id: string;
  login_at: string;
  logout_at: string | null;
  time_spent_minutes: number | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Video {
  id: string;
  title: string;
  created_at: string;
  likes: number;
  watch_time_minutes: number;
  senior_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalSessions: 0,
    activeToday: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!userRoles) {
        toast({
          title: "Access Denied",
          description: "You do not have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load user sessions with profiles
      const { data: sessionsData } = await supabase
        .from("user_sessions")
        .select("*")
        .order("login_at", { ascending: false });

      // Fetch profile data separately
      const userIds = [...new Set(sessionsData?.map(s => s.user_id) || [])];
      const { data: profilesMap } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      // Merge the data
      const sessionsWithProfiles = sessionsData?.map(session => ({
        ...session,
        profiles: profilesMap?.find(p => p.id === session.user_id),
      })) || [];

      // Load videos with senior profiles
      const { data: videosData } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch senior profiles
      const seniorIds = [...new Set(videosData?.map(v => v.senior_id) || [])];
      const { data: seniorProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", seniorIds);

      // Merge video data with profiles
      const videosWithProfiles = videosData?.map(video => ({
        ...video,
        profiles: seniorProfiles?.find(p => p.id === video.senior_id),
      })) || [];

      // Load profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setSessions(sessionsWithProfiles);
      setVideos(videosWithProfiles);
      setProfiles(profilesData || []);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeToday = sessionsWithProfiles.filter(
        (s) => new Date(s.login_at) >= today
      ).length;

      setStats({
        totalUsers: profilesData?.length || 0,
        totalVideos: videosData?.length || 0,
        totalSessions: sessionsData?.length || 0,
        activeToday,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });

      await loadDashboardData();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeToday}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">User Sessions</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Sessions & Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>Logout Time</TableHead>
                      <TableHead>Time Spent (min)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell>{session.profiles?.email || "N/A"}</TableCell>
                        <TableCell>{formatDate(session.login_at)}</TableCell>
                        <TableCell>
                          {session.logout_at ? formatDate(session.logout_at) : "Active"}
                        </TableCell>
                        <TableCell>
                          {session.time_spent_minutes?.toFixed(2) || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Upload Time</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Watch Time (min)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>{video.title}</TableCell>
                        <TableCell>{video.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell>{formatDate(video.created_at)}</TableCell>
                        <TableCell>{video.likes}</TableCell>
                        <TableCell>{video.watch_time_minutes}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Registered At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.full_name}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell className="capitalize">{profile.role}</TableCell>
                        <TableCell>{formatDate(profile.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;
