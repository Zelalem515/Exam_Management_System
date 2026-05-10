import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const TakeExam = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // 1. Initial State Guards
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState(() => {
        if (!user) return {};
        const saved = localStorage.getItem(`exam_${id}_${user.id}`);
        return saved ? JSON.parse(saved) : {};
    });
    const [loading, setLoading] = useState(true);
    const [isStarted, setIsStarted] = useState(false);
    const [warnings, setWarnings] = useState(0);
    
    // Timer state: Check localStorage first so progress isn't lost on refresh
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedTime = localStorage.getItem(`timer_${id}_${user?.id}`);
        return savedTime ? parseInt(savedTime) : 1800; 
    });
    
    const timerRef = useRef(null);
    const isSubmitting = useRef(false);

    // --- 2. SUBMIT LOGIC ---
    const handleSubmit = useCallback(async () => {
        if (isSubmitting.current) return;
        isSubmitting.current = true; 
        clearInterval(timerRef.current);

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        let score = 0;
        questions.forEach(q => {
            if (selectedAnswers[q.question_id] === q.correct_option) {
                score += 1;
            }
        });

        try {
            await axios.post('http://localhost:5000/results/submit', {
                user_id: user.id,
                exam_id: id,
                score: score,
                total_questions: questions.length
            });

            // Cleanup storage after successful submission
            localStorage.removeItem(`exam_${id}_${user.id}`);
            localStorage.removeItem(`timer_${id}_${user.id}`);
            
            alert(`Exam Submitted! Score: ${score} / ${questions.length}`);
            navigate('/dashboard');
        } catch (err) {
            console.error("Submission error:", err);
            isSubmitting.current = false;
            alert("Connection error. Your answers are saved locally. Try submitting again.");
        }
    }, [questions, selectedAnswers, user, id, navigate]);

    // --- 3. FETCH QUESTIONS ---
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchQuestions = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/exams/${id}/questions`, {
                    params: { userId: user.id }
                });
                setQuestions(shuffleArray(res.data));
                setLoading(false);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    alert("System: You have already submitted this exam.");
                    navigate('/dashboard');
                } else {
                    console.error("Fetch error", err);
                    setLoading(false);
                }
            }
        };
        fetchQuestions();
    }, [id, user, navigate]);

    // --- 4. TIMER & AUTO-SAVE ---
    useEffect(() => {
        if (!isStarted || loading) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                // Save time to localStorage every second
                localStorage.setItem(`timer_${id}_${user.id}`, newTime.toString());
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [isStarted, loading, handleSubmit, id, user]);

    // --- 5. FULLSCREEN & SECURITY ---
    const startExam = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen();
        setIsStarted(true);
    };

    // --- 5A. COPY-PASTE & RIGHT-CLICK PREVENTION ---
    useEffect(() => {
        if (!isStarted) return;

        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        const handleCopy = (e) => {
            e.preventDefault();
            return false;
        };

        const handleCut = (e) => {
            e.preventDefault();
            return false;
        };

        const handlePaste = (e) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e) => {
            // Ctrl+C, Ctrl+X, Ctrl+V
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X' || e.key === 'v' || e.key === 'V')) {
                e.preventDefault();
                return false;
            }
            // Ctrl+U (View Source)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                return false;
            }
            // F12 (Inspect Element)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCut);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isStarted]);

    useEffect(() => {
        if (!isStarted) return;

        const handleSecurity = (msg) => {
            if (isSubmitting.current) return;
            setWarnings(prev => {
                if (prev + 1 >= 3) {
                    alert("Security Breach: 3rd Warning. Auto-submitting now.");
                    handleSubmit();
                    return 3;
                }
                alert(`${msg}. Warning ${prev + 1}/3`);
                return prev + 1;
            });
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') handleSecurity("Tab Switch Detected");
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isStarted, handleSubmit]);

    // Save answer progress as they click
    const handleAnswerChange = (qId, option) => {
        const updated = { ...selectedAnswers, [qId]: option };
        setSelectedAnswers(updated);
        localStorage.setItem(`exam_${id}_${user.id}`, JSON.stringify(updated));
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <div style={styles.center}>Loading Exam...</div>;

    if (!isStarted) {
        return (
            <div style={styles.overlay}>
                <div style={styles.card}>
                    <h2>Ready to start?</h2>
                    <p>Duration: 30 Minutes. Full-screen is mandatory.</p>
                    <button onClick={startExam} style={styles.startBtn}>Enter Exam</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span>Time Left: <strong>{formatTime(timeLeft)}</strong></span>
                <span style={styles.warnText}>Warnings: {warnings}/3</span>
            </div>

            {questions.map((q, i) => (
                <div key={q.question_id} style={styles.qCard}>
                    <p><strong>Q{i + 1}: {q.question_text}</strong></p>
                    {['A', 'B', 'C', 'D'].map(opt => (
                        <label key={opt} style={styles.option}>
                            <input 
                                type="radio" 
                                name={`q-${q.question_id}`}
                                checked={selectedAnswers[q.question_id] === opt}
                                onChange={() => handleAnswerChange(q.question_id, opt)}
                            /> {opt}: {q[`option_${opt.toLowerCase()}`]}
                        </label>
                    ))}
                </div>
            ))}
            <button onClick={handleSubmit} style={styles.submitBtn}>Submit Final Exam</button>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '700px', margin: '0 auto', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' },
    center: { textAlign: 'center', marginTop: '100px' },
    overlay: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4' },
    card: { background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    header: { position: 'sticky', top: 0, background: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #28a745', zIndex: 10 },
    warnText: { color: 'red', fontWeight: 'bold' },
    qCard: { background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    option: { display: 'block', padding: '10px', border: '1px solid #eee', marginTop: '5px', borderRadius: '5px', cursor: 'pointer' },
    startBtn: { background: '#28a745', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', cursor: 'pointer' },
    submitBtn: { background: '#007bff', color: 'white', border: 'none', width: '100%', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer' }
};

export default TakeExam;