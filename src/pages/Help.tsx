import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f9f9f9' }}>
      <header style={{ background: 'linear-gradient(to right, #5a8dee, #7b9ff7)', color: 'white', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ flex: 1 }}>Contact Us</h1>
          <Button onClick={() => navigate("/")} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            Back to Home
          </Button>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
        <h2 style={{ color: '#5a8dee', textAlign: 'center', marginBottom: '2rem' }}>Customer Support</h2>
        
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: '#444', margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
            <i className="fas fa-phone" style={{ color: '#5a8dee', fontSize: '1.2rem' }}></i>
            <span>1800-123-4567 (Toll-free)</span>
          </div>

          <div style={{ fontSize: '1rem', color: '#444', margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
            <i className="fas fa-envelope" style={{ color: '#5a8dee', fontSize: '1.2rem' }}></i>
            <span>support@seniorassist.org</span>
          </div>

          <div style={{ fontSize: '1rem', color: '#444', margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
            <i className="fas fa-map-marker-alt" style={{ color: '#5a8dee', fontSize: '1.2rem' }}></i>
            <span>456 Help Street, Hyderabad, Telangana</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
