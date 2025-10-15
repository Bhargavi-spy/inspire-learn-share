import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      setIsAdmin(!!userRoles);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const selectRole = (role: 'citizen' | 'school' | 'upload') => {
    setShowPopup(false);
    
    if (role === 'citizen') {
      setShowMainContent(true);
    } else if (role === 'school') {
      navigate("/auth?role=student");
    } else if (role === 'upload') {
      navigate("/auth?role=school");
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0f2f5' }}>
      {/* Navigation Bar */}
      <nav style={{ backgroundColor: '#0d1b2a', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <a href="#" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none' }}>
            Legacy<span style={{ color: '#778da9' }}>#Genα</span>
          </a>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'color 0.3s' }}>About</a>
            <a href="/services" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'color 0.3s' }}>Services</a>
            <a href="/help" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'color 0.3s' }}>Help</a>
            <a href="/terms" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'color 0.3s' }}>Terms</a>
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                style={{
                  backgroundColor: '#e0e1dd',
                  color: '#1b263b',
                  padding: '8px 16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Shield size={16} />
                Admin
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Header with buttons and burger menu */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1b263b', color: 'white', padding: '15px 20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            onClick={() => navigate("/auth")}
            style={{ 
              backgroundColor: '#e0e1dd', 
              color: '#1b263b',
              padding: '12px 20px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate("/auth")}
            style={{ 
              backgroundColor: '#415a77', 
              color: 'white',
              padding: '12px 20px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Sign Up
          </Button>
        </div>
        <Menu 
          style={{ fontSize: '24px', cursor: 'pointer' }} 
          onClick={() => setShowMenu(!showMenu)}
        />
      </header>

      {/* Popup for Role Selection */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7) url("https://media.edexlive.com/edexlive%2Fimport%2F2019%2F3%2F7%2Foriginal%2Fvijedex20.jpg?w=1024&auto=format%2Ccompress&fit=max") center/cover no-repeat',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '30px 50px',
            textAlign: 'center',
            borderRadius: '8px',
            maxWidth: '500px'
          }}>
            <nav style={{ backgroundColor: '#0d1b2a', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <a href="#" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none' }}>
                  Legacy<span style={{ color: '#778da9' }}>#Genα</span>
                </a>
              </div>
            </nav>
            <h2 style={{ marginBottom: '20px', color: '#1b263b', fontSize: '28px' }}>Welcome to Legacy Gen Alpha</h2>
            <p style={{ fontStyle: 'italic', color: '#415a77', textAlign: 'center', margin: '20px 0', fontSize: '18px', lineHeight: '1.6' }}>
              <span style={{ fontSize: '24px', color: '#778da9' }}>"</span>
              The wisdom of age meets the curiosity of youth - bridging generations through shared knowledge.
              <span style={{ fontSize: '24px', color: '#778da9' }}>"</span>
            </p>
            <p style={{ marginBottom: '20px' }}>Initiative taken by <b>Vasavya Mahila Mandali (VMM)</b> in collaboration with <b>NTR District collector Dr.G.Lakshmisha I.A.S</b></p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                onClick={() => selectRole('citizen')}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  backgroundColor: '#e0e1dd',
                  color: '#1b263b',
                  fontWeight: '600'
                }}
              >
                Create Memories (citizen)
              </Button>
              <Button
                onClick={() => selectRole('school')}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  backgroundColor: '#e0e1dd',
                  color: '#1b263b',
                  fontWeight: '600'
                }}
              >
                Explore Memories (kids)
              </Button>
              <Button
                onClick={() => selectRole('upload')}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  backgroundColor: '#415a77',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                School Portal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Citizen Homepage */}
      {showMainContent && (
        <div>
          <div style={{ padding: '40px 20px', background: 'white', margin: '20px auto', maxWidth: '1000px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h2 style={{ color: '#1b263b' }}>Preserve Knowledge</h2>
            <p>Capture and share decades of professional experience, life skills, and cultural knowledge with the next generation.</p>
          </div>

          <div style={{ padding: '40px 20px', background: 'white', margin: '20px auto', maxWidth: '1000px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h2 style={{ color: '#1b263b' }}>Active Aging</h2>
            <p>Provide senior citizens with opportunities to stay engaged, share their expertise, and make a lasting impact.</p>
          </div>

          <div style={{ padding: '40px 20px', background: 'white', margin: '20px auto', maxWidth: '1000px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h2 style={{ color: '#1b263b' }}>Benefits for Everyone</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <h3 style={{ color: '#1b263b' }}>For Senior Citizens</h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Stay mentally active and engaged</li>
                  <li>Share valuable life experience and expertise</li>
                  <li>Earn rewards for every minute of teaching (0.75 points/minute)</li>
                  <li>Build meaningful connections with younger generations</li>
                  <li>Make a lasting impact on education</li>
                </ul>
              </div>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <h3 style={{ color: '#1b263b' }}>For Schools</h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Access to experienced professionals and experts</li>
                  <li>Real-world insights and practical knowledge</li>
                  <li>Enhanced learning experiences for students</li>
                  <li>Free or low-cost educational resources</li>
                  <li>Mentorship opportunities for students</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Explore Magic Hours */}
          <Button
            onClick={() => navigate("/auth")}
            style={{
              display: 'block',
              width: '220px',
              margin: '30px auto',
              padding: '14px 20px',
              backgroundColor: '#1b263b',
              color: 'white',
              fontSize: '16px'
            }}
          >
            Explore Magic Hours
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
