import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f9f9f9', color: '#333' }}>
      <header style={{ background: 'linear-gradient(to right, #5a8dee, #7b9ff7)', color: 'white', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ flex: 1 }}>Our Services</h1>
          <Button onClick={() => navigate("/")} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            Back to Home
          </Button>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: 'auto', padding: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#5a8dee' }}>📚 Storytelling & Wisdom Sharing</h2>
          <p>Live or recorded sessions where elders share folk tales, life experiences, or valuable lessons from history and culture.</p>
          <img 
            src="https://scontent.fvga5-1.fna.fbcdn.net/v/t1.6435-9/90148786_648992665938564_3167392626789842944_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=fQUnhTkr1FkQ7kNvwFwjc1u&_nc_oc=AdkuvnfFYFuocl_5l3UtvNJ2bp02jcbZEKQHEQqizFYD3W44JWGGc_h8A78IXHvmK2A&_nc_zt=23&_nc_ht=scontent.fvga5-1.fna&_nc_gid=bwLtXypceBi7favj3J4pAg&oh=00_AfTtOR3BhoiCG8DQqltSTVqxbNPSilvWOwVM75cFMGxpVA&oe=68B3F116" 
            alt="Storytelling Service"
            style={{ width: '100%', borderRadius: '8px', margin: '1rem 0' }}
          />
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#5a8dee' }}>👩‍🍳 Skill-Based Classes</h2>
          <p>Interactive video sessions where seniors demonstrate traditional skills — like cooking, gardening, or weaving — to young learners.</p>
          <img 
            src="https://scontent.fvga5-1.fna.fbcdn.net/v/t1.6435-9/41321445_274050776766090_5634353512977530880_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=p32WdAe8J_8Q7kNvwFY7d2d&_nc_oc=AdlDKPahcPA9E6jWViA4hjO8y2XWTPQVLyG7ynXJE5XrN_TzMy7Tc6QRSDRzXwbY9zs&_nc_zt=23&_nc_ht=scontent.fvga5-1.fna&_nc_gid=pQLUQrfJ_d5yzt7fACIlYg&oh=00_AfToEVZNIhwxry-G0o-f-aECrrKWfr_6lAfNHr3aQZqyGA&oe=68B3D339" 
            alt="Skills Class Demo"
            style={{ width: '100%', borderRadius: '8px', margin: '1rem 0' }}
          />
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#5a8dee' }}>🎥 Intergenerational Video Hosting</h2>
          <p>Upload and showcase videos where seniors and children collaborate, share conversations, or teach each other something new.</p>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#5a8dee' }}>🪙 Coin-Based Rewards System</h2>
          <p>Seniors earn coins based on views, engagement, and watch time. These coins can be redeemed for recognition, perks, or donations to causes they care about.</p>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#5a8dee' }}>🎓 School-Senior Collaboration</h2>
          <p>Schools can invite seniors to conduct virtual guest lectures, life skills sessions, or cultural storytelling for their students.</p>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#5a8dee' }}>📺 YouTube Live Streaming Integration</h2>
          <p>Seniors can host live sessions via YouTube links embedded into the platform. Students watch, interact, and learn in real time.</p>
        </div>
      </div>
    </div>
  );
};

export default Services;
