import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'student' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      alert("Registration Failed: " + err.response.data.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" placeholder="Full Name" onChange={e => setFormData({...formData, full_name: e.target.value})} required />
        <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
        
        <label>I am a:</label>
        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
        
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
};

const styles = {
  container: { textAlign: 'center', marginTop: '50px' },
  form: { display: 'flex', flexDirection: 'column', width: '300px', margin: '0 auto', gap: '10px' }
};

export default Register;