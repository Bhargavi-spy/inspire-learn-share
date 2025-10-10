import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f4f4f9' }}>
      <header style={{ background: 'linear-gradient(to right, #5a8dee, #7b9ff7)', color: 'white', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ textAlign: 'center', color: '#eceff0', flex: 1 }}>About Legacy Gen Alpha</h1>
          <Button onClick={() => navigate("/")} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            Back to Home
          </Button>
        </div>
      </header>

      <p style={{ textAlign: 'center', padding: '1rem 2rem', fontSize: '1rem', lineHeight: '1.6' }}>
        "Initiative taken by <b>Dr.B.Keerthi</b> president <b>Dr.Deeksha</b> from <b>Vasavya Mahila Mandali (VMM)</b> in collaboration with <b>NTR District collector Dr.G.Lakshmisha I.A.S</b> The technical support for the app development done by the team of <b>NRI INSTITUTE OF TECHNOLOGY, Agiripalli"</b>
      </p>

      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        <img 
          src="https://scontent.fvga5-1.fna.fbcdn.net/v/t39.30808-6/476238038_1814202972750855_5587653352779957223_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=CyHJJtcTvs8Q7kNvwFEyd7O&_nc_oc=AdkflDeqp9xoDPm2EXUvxrjaifM8rODvmRp_RpCDqqbG3Z0A_g9qcS826dY4s4ZWeuc&_nc_zt=23&_nc_ht=scontent.fvga5-1.fna&_nc_gid=04kamcG47p9xKiIFIEsv7Q&oh=00_AfSMvQUjGG_kzYeg2OPqacVmjU3WoZWOHlwaIHBZI-QoTA&oe=68925645" 
          alt="Connecting Generations"
          style={{ width: '100%', borderRadius: '10px', margin: '1rem 0' }}
        />

        <p style={{ lineHeight: '1.7', margin: '1rem 0' }}>
          <strong>Legacy Gen Alpha</strong> is a unique platform designed to bridge the generational gap by connecting seniors and children through shared learning experiences. We believe that wisdom, tradition, and lived experience should not fade with time — they should flourish in the minds of future generations.
        </p>

        <p style={{ lineHeight: '1.7', margin: '1rem 0' }}>
          Through story-sharing, skill-sharing, and interactive video sessions, seniors can pass on vital life knowledge to curious young minds. This initiative not only preserves cultural heritage but also fosters empathy, respect, and connection in a divided digital world.
        </p>

        <p style={{ lineHeight: '1.7', margin: '1rem 0' }}>
          We envision a society where a 10-year-old can learn how to cook traditional recipes from a 70-year-old, or understand the value of money and kindness from someone who's lived through changing times.
        </p>

        <p style={{ lineHeight: '1.7', margin: '1rem 0' }}>
          <strong>Our mission</strong> is to harness technology for something beautiful — connecting the old and the new, the past and the future, in a digital ecosystem that respects both.
        </p>
      </div>
    </div>
  );
};

export default About;
