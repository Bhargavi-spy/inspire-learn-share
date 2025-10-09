import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function SchoolPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitationResponses, setInvitationResponses] = useState<any[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    checkAuth();
    fetchInvitations();
    fetchResponses();
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

    if (!profileData || profileData.role !== "school") {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }

    setProfile(profileData);
  };

  const fetchInvitations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("school_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching invitations");
    } else {
      setInvitations(data || []);
    }
  };

  const fetchResponses = async () => {
    const { data, error } = await supabase
      .from("invitation_responses")
      .select(`
        *,
        profiles!invitation_responses_senior_id_fkey (
          full_name,
          email
        )
      `);

    if (error) {
      toast.error("Error fetching responses");
    } else {
      setInvitationResponses(data || []);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Please provide a title");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("invitations").insert({
        school_id: user.id,
        title,
        description,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
      });

      if (error) throw error;

      toast.success("Invitation created successfully!");
      setTitle("");
      setDescription("");
      setEventDate("");
      fetchInvitations();
      fetchResponses();
    } catch (error: any) {
      toast.error(error.message || "Error creating invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase.from("invitations").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Invitation deleted");
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.message || "Error deleting invitation");
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
            <h1 className="text-2xl font-bold text-primary">School Portal</h1>
            <p className="text-sm text-muted-foreground">Welcome, {profile.full_name}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Invitation Form */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Invitation
              </CardTitle>
              <CardDescription>
                Send invitations to seniors for your school events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInvitation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Guest Lecture on Organic Farming"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the event details..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Invitation"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Invitations List */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Your Invitations</CardTitle>
              <CardDescription>
                {invitations.length} invitation{invitations.length !== 1 ? "s" : ""} sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {invitations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No invitations yet. Create your first one!
                  </p>
                ) : (
                  invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-soft transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{invitation.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {invitation.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {invitation.description}
                        </p>
                      )}
                      {invitation.event_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4" />
                          {new Date(invitation.event_date).toLocaleString()}
                        </div>
                      )}
                      {(() => {
                        const responses = invitationResponses.filter(r => r.invitation_id === invitation.id);
                        const accepted = responses.filter(r => r.status === 'accepted');
                        
                        if (accepted.length > 0) {
                          return (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium text-green-600">
                                <CheckCircle className="inline h-4 w-4 mr-1" />
                                {accepted.length} Senior{accepted.length !== 1 ? 's' : ''} Accepted
                              </p>
                              <div className="space-y-1">
                                {accepted.map((response: any) => (
                                  <div key={response.id} className="text-sm text-muted-foreground pl-5">
                                    • {response.profiles?.full_name} ({response.profiles?.email})
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <p className="text-sm text-muted-foreground mt-2">No responses yet</p>
                        );
                      })()}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
