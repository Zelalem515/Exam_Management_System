import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Send login credentials to the server (using .trim() to avoid accidental spaces)
      const res = await axios.post('http://localhost:5000/auth/login', { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      const { token, user } = res.data;

      // 2. Update Global State in App.js
      setUser({
        id: user.id, 
        name: user.name,
        role: user.role,
        token: token
      });

      // Optional: Save token to localStorage for persistence
      localStorage.setItem('token', token);

      // 3. ROLE-BASED REDIRECTION 
      // This matches the routes we defined in App.js
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'instructor') {
        navigate('/instructor-dashboard');
      } else {
        navigate('/dashboard'); // Standard Student Dashboard
      }

    } catch (err) {
      // Improved error reporting
      const errorMsg = err.response?.data?.message || "Check your internet connection or server status.";
      alert("Login Failed: " + errorMsg);
      console.error("Login Error Details:", err.response?.data);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Added DTU context for professional look */}
        <h2 style={styles.title}>DTU E-Learning</h2>
        <p style={{marginBottom: '20px', color: '#666'}}>Sign in to your account</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="zedo@dtu.com" 
              style={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.footer}>
          Don't have an account? <a href="/register" style={styles.link}>Register here</a>
        </p>
      </div>
    </div>
  );
};

// --- STYLES (Keep your existing professional styles) ---
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
  card: { padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { marginBottom: '10px', color: '#007bff', fontSize: '24px', fontWeight: 'bold' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#555' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  button: { padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  footer: { marginTop: '25px', fontSize: '14px', color: '#666' },
  link: { color: '#007bff', textDecoration: 'none', fontWeight: '600' }
};

export default Login;