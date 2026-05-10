import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ setUser }) => {
    const [users, setUsers] = useState([]);
    const [exams, setExams] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // State for manual student registration - Added department
    const [newStudent, setNewStudent] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        department: 'Information Technology' // Default value for DTU
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const usersRes = await axios.get('http://localhost:5000/admin/users');
            const examsRes = await axios.get('http://localhost:5000/admin/exam-stats');
            setUsers(usersRes.data);
            setExams(examsRes.data);
        } catch (err) {
            console.error("Error fetching admin data", err);
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    // --- A. Manual Registration ---
    const handleManualRegister = async (e) => {
        e.preventDefault();
        try {
            // Sending the full newStudent object including department
            await axios.post('http://localhost:5000/admin/register-manual', newStudent);
            alert("Student Registered Successfully!");
            // Reset form but keep default department
            setNewStudent({ name: '', email: '', password: '', department: 'Information Technology' });
            fetchAdminData();
        } catch (err) {
            alert(err.response?.data || "Registration failed. Check if email exists.");
        }
    };

    // --- B. CSV Bulk Upload ---
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a .csv file first");

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/admin/upload-students', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(res.data.message);
            fetchAdminData();
        } catch (err) {
            alert("CSV Upload Failed. Ensure headers are: name, email, password, department");
        } finally {
            setLoading(false);
        }
    };

    // --- C. Session Reset ---
    const handleResetSession = async (userId) => {
        try {
            await axios.post(`http://localhost:5000/admin/reset-session/${userId}`);
            alert("Session cleared successfully.");
            fetchAdminData();
        } catch (err) {
            alert("Failed to reset session.");
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <h1 style={{color: '#007bff', margin: 0}}>Debre Tabor University</h1>
                        <h2 style={{fontSize: '1.1rem', color: '#555', margin: '5px 0'}}>Admin Command Center</h2>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            <div style={styles.dashboardGrid}>
                {/* 1. Registration Section */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>1. Student Enrollment</h3>
                    <div style={styles.tabSection}>
                        <p style={styles.label}>Bulk Upload via CSV</p>
                        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={styles.fileInput} />
                        <button onClick={handleFileUpload} style={styles.primaryBtn} disabled={loading}>
                            {loading ? "Processing..." : "Upload CSV"}
                        </button>
                    </div>
                    <hr style={styles.divider} />
                    
                    <form onSubmit={handleManualRegister} style={styles.form}>
                        <p style={styles.label}>Manual Registration</p>
                        <input type="text" placeholder="Full Name" value={newStudent.name} 
                            onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} style={styles.input} required />
                        
                        <input type="email" placeholder="Email" value={newStudent.email} 
                            onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} style={styles.input} required />
                        
                        <input type="password" placeholder="Password" value={newStudent.password} 
                            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} style={styles.input} required />
                        
                        {/* New Department Dropdown */}
                        <select 
                            value={newStudent.department} 
                            onChange={(e) => setNewStudent({...newStudent, department: e.target.value})} 
                            style={styles.input}
                        >
                            <option value="Information Technology">Information Technology</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                        </select>
                        
                        <button type="submit" style={styles.secondaryBtn}>Add Student</button>
                    </form>
                </div>

                {/* 2. Exam Monitoring Section */}
                <div style={styles.card}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <h3 style={styles.cardTitle}>2. System Exam Monitoring</h3>
                        <button onClick={fetchAdminData} style={styles.refreshBtn}>Refresh Data</button>
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHead}>
                                <th style={styles.th}>Exam Title</th>
                                <th style={styles.th}>Instructor</th>
                                <th style={styles.th}>Participants</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.length > 0 ? exams.map(ex => (
                                <tr key={ex.exam_id} style={styles.tableRow}>
                                    <td style={styles.td}>{ex.title}</td>
                                    <td style={styles.td}>{ex.instructor_name}</td>
                                    <td style={{...styles.td, textAlign: 'center'}}><strong>{ex.student_count}</strong></td>
                                </tr>
                            )) : <tr><td colSpan="3" style={styles.empty}>No exams uploaded yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. User Session Control Section */}
            <div style={{ ...styles.card, marginTop: '25px' }}>
                <h3 style={styles.cardTitle}>3. User Session Control & Security</h3>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHead}>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Dept</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.user_id} style={styles.tableRow}>
                                <td style={styles.td}>{u.full_name}</td>
                                <td style={styles.td}>{u.email}</td>
                                <td style={styles.td}>{u.department || 'N/A'}</td>
                                <td style={styles.td}><span style={styles.roleBadge(u.role)}>{u.role.toUpperCase()}</span></td>
                                <td style={styles.td}>
                                    {u.is_logged_in ? 
                                        <span style={{color: '#d9534f', fontWeight: 'bold'}}>● Active Session</span> : 
                                        <span style={{color: '#5cb85c'}}>○ Idle</span>
                                    }
                                </td>
                                <td style={styles.td}>
                                    {u.role === 'student' && u.is_logged_in && (
                                        <button onClick={() => handleResetSession(u.user_id)} style={styles.resetBtn}>
                                            Force Logout
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, sans-serif" },
    header: { borderBottom: '3px solid #007bff', marginBottom: '30px', paddingBottom: '15px' },
    dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '25px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '1.25rem', marginBottom: '20px', color: '#2c3e50', fontWeight: 'bold' },
    label: { fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '8px', fontWeight: 'bold', display: 'block' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #dcdde1', fontSize: '0.9rem', outline: 'none' },
    fileInput: { marginBottom: '10px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: '#f8f9fa', textAlign: 'left' },
    th: { padding: '12px', color: '#7f8c8d', borderBottom: '2px solid #eee' },
    td: { padding: '12px', borderBottom: '1px solid #eee' },
    tableRow: { transition: '0.2s', '&:hover': { backgroundColor: '#fcfcfc' } },
    primaryBtn: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    secondaryBtn: { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
    resetBtn: { backgroundColor: '#e67e22', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' },
    logoutBtn: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' },
    refreshBtn: { backgroundColor: '#f1f2f6', border: 'none', color: '#2f3542', padding: '5px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
    divider: { margin: '20px 0', border: '0', borderTop: '1px solid #eee' },
    empty: { textAlign: 'center', padding: '30px', color: '#bdc3c7' },
    roleBadge: (role) => ({
        backgroundColor: role === 'admin' ? '#2c3e50' : role === 'instructor' ? '#3498db' : '#95a5a6',
        color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
    })
};

export default AdminDashboard;