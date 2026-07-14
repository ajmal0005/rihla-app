'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Something went wrong');
    } else {
      router.push('/login');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card pad" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '8px', marginTop: 0 }}>Create Account</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>Join Rihla to organize your days.</p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Username</label>
            <input 
              type="text" 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: '15px' }} 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Password</label>
            <input 
              type="password" 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: '15px' }} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign Up</button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
