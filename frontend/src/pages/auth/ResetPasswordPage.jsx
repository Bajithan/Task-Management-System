import React, { useState } from 'react';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    console.log('Reset link requested for:', email);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Reset Password</h2>
      <p>Enter your email address to receive a password reset link.</p>
      <form onSubmit={handleReset}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email Address:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} 
            required 
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Send Reset Link</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;