import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = ({ user, setUser }) => {
  const [exams, setExams] = useState([]);
  const [myGrades, setMyGrades] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If the app reloads and user state is lost, redirect to login
    if (!user || !user.id) {
        navigate('/login');
        return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch all available exams
        const examsRes = await axios.get('http://localhost:5000/exams');
        setExams(examsRes.data);

        // 2. Fetch grades specifically for this student
        const gradesRes = await axios.get(`http://localhost:5000/results/student/${user.id}`);
        setMyGrades(gradesRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
        // Important: Tell backend to set is_logged_in = FALSE
        await axios.post('http://localhost:5000/auth/logout', { userId: user.id });
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    } catch (err) {
        console.error("Logout failed", err);
        // Fallback: clear local state anyway
        setUser(null);
        navigate('/login');
    }
  };

  const handleTakeExam = (examId) => {
    navigate(`/take-exam/${examId}`);
  };

  if (loading) return <div style={styles.loader}>Loading DTU Exam Portal...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
            <h1 style={styles.title}>Student Dashboard</h1>
            <p style={styles.welcome}>Welcome back, <strong>{user?.name}</strong>!</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      {/* SECTION: AVAILABLE EXAMS */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Available Exams</h3>
            <span style={styles.badge}>{exams.length} Total</span>
        </div>
        <div style={styles.grid}>
          {exams.length > 0 ? exams.map((exam) => {
            // Check if student already has a result for this exam ID
            const isCompleted = myGrades.some(grade => grade.exam_id === exam.exam_id);

            return (
              <div key={exam.exam_id} style={styles.card}>
                <div style={styles.examIcon}>📝</div>
                <h4 style={styles.examTitle}>{exam.title}</h4>
                <p style={styles.examMeta}>
                    ID: #{exam.exam_id} | {new Date(exam.created_at).toLocaleDateString()}
                </p>
                
                {isCompleted ? (
                  <button style={styles.completedBtn} disabled>
                    Completed ✅
                  </button>
                ) : (
                  <button style={styles.btn} onClick={() => handleTakeExam(exam.exam_id)}>
                    Start Exam
                  </button>
                )}
              </div>
            );
          }) : (
            <div style={styles.emptyState}>No exams have been uploaded by instructors yet.</div>
          )}
        </div>
      </div>

      {/* SECTION: MY GRADES */}
      <div style={styles.gradeSection}>
        <h3 style={styles.sectionTitle}>Your Performance History</h3>
        {myGrades.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
                <thead>
                <tr style={styles.tableHeader}>
                    <th style={styles.th}>Exam Name</th>
                    <th style={styles.th}>Score</th>
                    <th style={styles.th}>Percentage</th>
                    <th style={styles.th}>Date</th>
                </tr>
                </thead>
                <tbody>
                {myGrades.map((g, index) => {
                    const percentage = ((g.score / g.total_questions) * 100).toFixed(1);
                    return (
                        <tr key={index} style={styles.tableRow}>
                        <td style={styles.td}>{g.title}</td>
                        <td style={styles.td}><strong>{g.score} / {g.total_questions}</strong></td>
                        <td style={styles.td}>
                            <span style={styles.percentBadge(percentage)}>{percentage}%</span>
                        </td>
                        <td style={styles.td}>{new Date(g.submitted_at).toLocaleDateString()}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        ) : (
          <p style={styles.emptyText}>You haven't completed any exams yet. Your scores will appear here.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #28a745', marginBottom: '30px', paddingBottom: '15px' },
  title: { margin: 0, color: '#2c3e50' },
  welcome: { margin: '5px 0 0 0', color: '#555' },
  logoutBtn: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  
  section: { marginBottom: '40px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  sectionTitle: { margin: 0, color: '#333', fontSize: '1.4rem' },
  badge: { backgroundColor: '#28a745', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' },
  card: { padding: '25px', border: 'none', borderRadius: '15px', backgroundColor: '#fff', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s' },
  examIcon: { fontSize: '2rem', marginBottom: '10px' },
  examTitle: { margin: '10px 0', color: '#2c3e50', fontSize: '1.1rem' },
  examMeta: { fontSize: '0.8rem', color: '#888', marginBottom: '20px' },
  
  btn: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  completedBtn: { backgroundColor: '#e9ecef', color: '#6c757d', border: '1px solid #dee2e6', padding: '12px', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 'bold', width: '100%' },

  gradeSection: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f8f9fa' },
  th: { textAlign: 'left', padding: '15px', color: '#666', borderBottom: '2px solid #eee' },
  td: { padding: '15px', borderBottom: '1px solid #eee', color: '#333' },
  tableRow: { transition: '0.3s' },
  
  percentBadge: (percent) => ({
    backgroundColor: percent >= 50 ? '#d4edda' : '#f8d7da',
    color: percent >= 50 ? '#155724' : '#721c24',
    padding: '4px 8px',
    borderRadius: '5px',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  }),
  
  loader: { textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#28a745', fontWeight: 'bold' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#eee', borderRadius: '10px', color: '#777' },
  emptyText: { color: '#999', fontStyle: 'italic', marginTop: '10px' }
};

export default StudentDashboard;