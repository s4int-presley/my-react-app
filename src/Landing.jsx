import { useNavigate } from 'react-router-dom';
import Silk from './Silk';

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <Silk speed={5} scale={1} color="#22D3EE" noiseIntensity={1.5} rotation={0} />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)',
          }}
        >
          🔥 Build habits that stick
        </div>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: 'white',
            textShadow: '0 0 40px rgba(34, 211, 238, 0.8)',
            marginBottom: '16px',
            lineHeight: 1.1,
          }}
        >
          DailyWin
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.75)',
            maxWidth: '480px',
            marginBottom: '36px',
          }}
        >
          Track your daily habits, build streaks, and turn small wins into lasting change — one day at a time.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 32px',
              borderRadius: '999px',
              border: 'none',
              background: 'white',
              color: 'black',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;