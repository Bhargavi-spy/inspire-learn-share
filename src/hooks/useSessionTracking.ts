import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSessionTracking = () => {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let sessionId: string | null = null;

    const startSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("user_sessions")
          .insert({
            user_id: user.id,
            login_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error starting session:", error);
          return;
        }

        sessionId = data.id;
        sessionIdRef.current = sessionId;
      } catch (error) {
        console.error("Error in startSession:", error);
      }
    };

    const endSession = async () => {
      if (!sessionId) return;

      try {
        await supabase
          .from("user_sessions")
          .update({
            logout_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      } catch (error) {
        console.error("Error ending session:", error);
      }
    };

    startSession();

    // End session on unmount or page unload
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        // Use sendBeacon for reliable logout tracking
        const logoutData = {
          id: sessionIdRef.current,
          logout_at: new Date().toISOString(),
        };
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_sessions?id=eq.${sessionIdRef.current}`,
          JSON.stringify(logoutData)
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      endSession();
    };
  }, []);
};
