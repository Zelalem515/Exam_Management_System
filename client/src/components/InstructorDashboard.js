import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  
  // File Upload States
  const [file, setFile] = useState(null);
  const [examTitle, setExamTitle] = useState('');

  // Manual Entry States
  const [manualQuestion, setManualQuestion] = useState({
    text: '', a: '', b: '', c: '', d: '', correct: 'A'
  });
  const [results, setResults] = useState([]); // To store student grades

  // Fetch results when the dashboard opens
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/instructor/performance/${user.id}`);
        setResults(res.data);
      } catch (err) {
        console.error("Error fetching student results", err);
      }
    };
    fetchResults();
  }, [user.id]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', { userId: user.id });
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
      // Force logout even if API fails
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || !examTitle) return alert("Please provide a title and a file.");

    const formData = new FormData();
    formData.append('examFile', file);
    formData.append('title', examTitle);
    formData.append('instructor_id', user.id); 

    try {
      await axios.post('http://localhost:5000/exams/upload', formData);
      alert("Exam File Parsed & Uploaded Successfully!");
    } catch (err) {
      alert("Upload failed. Check server console.");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      // We will build the /exams/manual route next!
      await axios.post('http://localhost:5000/exams/manual', {
        ...manualQuestion,
        title: examTitle,
        instructor_id: user.id
      });
      alert("Question Added Manually!");
      setManualQuestion({ text: '', a: '', b: '', c: '', d: '', correct: 'A' });
    } catch (err) {
      alert("Manual save failed.");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1>Instructor Dashboard</h1>
            <p>Welcome, <strong>{user.name}</strong></p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <div style={styles.grid}>
        {/* SECTION 1: FILE UPLOAD */}
        <div style={styles.card}>
          <h3>Option 1: Upload .txt Exam</h3>
          <p style={styles.hint}>Format: Q:, A:, B:, C:, D:, Ans:</p>
          <input 
            type="text" 
            placeholder="Exam Title (e.g. Mid-Term)" 
            style={styles.input}
            onChange={e => setExamTitle(e.target.value)} 
          />
          <input 
            type="file" 
            accept=".txt" 
            onChange={e => setFile(e.target.files[0])} 
          />
          <button onClick={handleFileUpload} style={styles.uploadBtn}>Parse & Save File</button>
        </div>

        {/* SECTION 2: MANUAL ENTRY */}
        <div style={styles.card}>
          <h3>Option 2: Add Question Manually</h3>
          <form onSubmit={handleManualSubmit} style={styles.form}>
            <textarea 
              placeholder="Question Text" 
              value={manualQuestion.text}
              onChange={e => setManualQuestion({...manualQuestion, text: e.target.value})}
              required 
            />
            <input type="text" placeholder="Option A" onChange={e => setManualQuestion({...manualQuestion, a: e.target.value})} required />
            <input type="text" placeholder="Option B" onChange={e => setManualQuestion({...manualQuestion, b: e.target.value})} required />
            <input type="text" placeholder="Option C" onChange={e => setManualQuestion({...manualQuestion, c: e.target.value})} required />
            <input type="text" placeholder="Option D" onChange={e => setManualQuestion({...manualQuestion, d: e.target.value})} required />
            
            <label>Correct Answer:</label>
            <select value={manualQuestion.correct} onChange={e => setManualQuestion({...manualQuestion, correct: e.target.value})}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            <button type="submit" style={styles.manualBtn}>Add Single Question</button>
          </form>
        </div>
      </div>
      <div style={styles.resultsSection}>
    <h2 style={{ color: '#007bff', marginBottom: '20px' }}>Student Performance Tracking</h2>
    <div style={styles.tableWrapper}>
        <table style={styles.table}>
            <thead>
                <tr style={styles.tableHeader}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Student Name</th>
                    <th style={styles.th}>Exam</th>
                    <th style={styles.th}>Score</th>
                    <th style={styles.th}>Date</th>
                </tr>
            </thead>
            <tbody>
                {results && results.length > 0 ? (
                    results.map((r, index) => (
                        <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                            <td style={styles.td}>{r.id}</td>
                            <td style={styles.td}>{r.student_name}</td>
                            <td style={styles.td}>{r.exam}</td>
                            <td style={styles.td}>
                                <span style={styles.scoreBadge}>
                                    {r.score}%
                                </span>
                            </td>
                            <td style={styles.td}>{new Date(r.date).toLocaleDateString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            No students have submitted exams yet.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>
    </div>
  );
};

const styles = {
  container: { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' },
  header: { borderBottom: '2px solid #007bff', marginBottom: '30px', paddingBottom: '20px' },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoutBtn: { 
    backgroundColor: '#dc3545', 
    color: 'white', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease'
  },
  grid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  card: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', flex: '1', minWidth: '300px' },
  input: { padding: '10px', marginBottom: '10px', width: '90%' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  hint: { fontSize: '12px', color: '#666' },
  uploadBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', marginTop: '10px' },
  manualBtn: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' },
  resultsSection: { marginTop: '50px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  tableHeader: { backgroundColor: '#007bff', color: 'white', textAlign: 'left' },
  th: { padding: '15px' },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  oddRow: { backgroundColor: '#ffffff' },
  scoreBadge: { 
    backgroundColor: '#e7f3ff', 
    color: '#007bff', 
    padding: '5px 10px', 
    borderRadius: '20px', 
    fontWeight: 'bold',
    fontSize: '14px'
  }
};


export default InstructorDashboard;