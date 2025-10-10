import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0f2f5' }}>
      {/* Navigation Bar */}
      <nav style={{ backgroundColor: '#0d1b2a', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <a href="/" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none' }}>
            Legacy<span style={{ color: '#778da9' }}>#Genα</span>
          </a>
          <Button onClick={() => navigate("/")} style={{ backgroundColor: '#415a77', color: 'white' }}>
            Back to Home
          </Button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#1b263b', marginBottom: '2rem' }}>Terms and Conditions</h1>
        
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#1b263b', marginBottom: '1rem' }}>English</h2>
          <ul style={{ lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            <li>Users must provide accurate personal information during registration.</li>
            <li>Students can only view content uploaded by seniors; no unauthorized uploads allowed.</li>
            <li>Seniors are responsible for the videos, live sessions, and content they share.</li>
            <li>Schools can send invitations, and seniors may accept or reject them at their discretion.</li>
            <li>Coins earned by seniors are based on views, watch time, and likes; all calculations are final.</li>
            <li>Users must respect the privacy and rights of all participants; harassment or misuse is prohibited.</li>
            <li>Live sessions via YouTube links must comply with platform policies and copyright laws.</li>
            <li>All user data, videos, invitations, and coins are stored securely in the database.</li>
            <li>The platform reserves the right to remove inappropriate content or suspend accounts violating rules.</li>
            <li>By using this platform, users agree to these terms and any updates made in the future.</li>
          </ul>
        </div>

        <div>
          <h2 style={{ color: '#1b263b', marginBottom: '1rem' }}>తెలుగు (Telugu)</h2>
          <ul style={{ lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            <li>రిజిస్ట్రేషన్ సమయంలో ఉపయోగకర్తలు సరైన వ్యక్తిగత సమాచారం అందించాలి.</li>
            <li>విద్యార్థులు సీనియర్లు అప్‌లోడ్ చేసిన కంటెంట్ మాత్రమే చూడగలరు; అనధికారిక అప్‌లోడ్‌లు నిషేధించబడ్డాయి.</li>
            <li>సీనియర్లు షేర్ చేసిన వీడియోలు, లైవ్ సెషన్స్ మరియు కంటెంట్ కోసం బాధ్యత వహిస్తారు.</li>
            <li>పాఠశాలలు ఆహ్వానాలను పంపవచ్చు, మరియు సీనియర్లు వాటిని ఆమోదించడానికి లేదా తిరస్కరించడానికి స్వతంత్రంగా ఉంటారు.</li>
            <li>సీనియర్లకు లభించే నాణేలు (Coins) వీక్షణ, వాచ్ టైం మరియు లైక్స్ ఆధారంగా లెక్కించబడతాయి; ఫైనల్ లెక్కింపులు మార్పు రహితంగా ఉంటాయి.</li>
            <li>అన్ని ఉపయోగకర్తలు పరస్పర గోప్యతను మరియు హక్కులను గౌరవించాలి; హింస లేదా దుర్వినియోగం నిషేధించబడుతుంది.</li>
            <li>YouTube లింక్ ద్వారా లైవ్ సెషన్స్ ప్లాట్‌ఫారమ్ విధానాలు మరియు కాపీరైట్ చట్టాలను అనుసరించాలి.</li>
            <li>అన్ని ఉపయోగకర్తల డేటా, వీడియోలు, ఆహ్వానాలు మరియు నాణేలు (Coins) సురక్షితంగా డేటాబేస్‌లో నిల్వ చేయబడతాయి.</li>
            <li>ప్లాట్‌ఫారమ్ అనుచిత కంటెంట్‌ను తొలగించడానికి లేదా నియమాలు ఉల్లంఘించే ఖాతాలను సస్పెండ్ చేయడానికి హక్కు కలిగి ఉంటుంది.</li>
            <li>ఈ ప్లాట్‌ఫారమ్‌ను ఉపయోగించడం ద్వారా, ఉపయోగకర్తలు ఈ నిబంధనలు మరియు భవిష్యత్ నవీకరణలను అంగీకరిస్తారు.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
