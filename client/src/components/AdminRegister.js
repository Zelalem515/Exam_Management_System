import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        secretKey: '' // Added a "Secret Key" so not just anyone can register as Admin
    });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Security check: Only register if they know the secret key
        if (formData.secretKey !== "DTU_ADMIN_2026") {
            return alert("Invalid Admin Secret Key!");
        }

        try {
            // We use a modified endpoint or handle the role logic
            const res = await axios.post('http://localhost:5000/auth/register-admin', {
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password
            });
            alert("Admin Created Successfully!");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Registration Failed");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{color: '#007bff'}}>System Administrator Setup</h2>
                <form onSubmit={handleRegister} style={styles.form}>
                    <input type="text" placeholder="Full Name" style={styles.input} 
                        onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                    
                    <input type="email" placeholder="Admin Email (zedo@dtu.com)" style={styles.input} 
                        onChange={e => setFormData({...formData, email: e.target.value})} required />
                    
                    <input type="password" placeholder="Create Password" style={styles.input} 
                        onChange={e => setFormData({...formData, password: e.target.value})} required />
                    
                    <input type="password" placeholder="Admin Secret Key" style={styles.input} 
                        onChange={e => setFormData({...formData, secretKey: e.target.value})} required />
                    
                    <button type="submit" style={styles.button}>Create Admin Account</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#343a40' },
    card: { padding: '40px', backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd' },
    button: { padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default AdminRegister;