import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else if (isRegistering) alert("Check your email for confirmation!");
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', width: '300px', margin: 'auto' }}>
      <h2 style={{color: '#000'}}>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleAuth}>
        <input type="email" placeholder="Email" style={{width: '100%', marginBottom: '10px', padding: '8px', color: '#000'}} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" style={{width: '100%', marginBottom: '10px', padding: '8px', color: '#000'}} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} style={{width: '100%', background: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer'}}>
          {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} style={{marginTop: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer'}}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}