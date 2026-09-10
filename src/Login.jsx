// src/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from './firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: '360px',
        margin: '100px auto',
        textAlign: 'center',
        padding: '32px',
        background: 'rgba(20, 20, 25, 0.6)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
      }}
    >
      <h2
        style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '24px',
          textShadow: '0 0 20px rgba(34, 211, 238, 0.6)',
        }}
      >
        {isSignUp ? 'Sign Up' : 'Log In'} to DailyWin
      </h2>

      <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '12px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            outline: 'none',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: '12px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 16px',
            borderRadius: '999px',
            border: 'none',
            background: 'white',
            color: 'black',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <button
        onClick={handleGoogleSignIn}
        style={{
          marginTop: '12px',
          padding: '12px 16px',
          width: '100%',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Continue with Google
      </button>

      <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.7)' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span
          style={{ color: '#22D3EE', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Log In' : 'Sign Up'}
        </span>
      </p>

      {error && <p style={{ color: '#ff6b6b', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

export default Login;