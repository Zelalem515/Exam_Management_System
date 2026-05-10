const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// --- 1. AUTHENTICATION ---

app.post('/auth/register-admin', async (req, res) => {
    try {
        const { full_name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await pool.query(
            "INSERT INTO users (full_name, email, password_hash, role, is_logged_in) VALUES ($1, $2, $3, 'admin', FALSE)",
            [full_name, email, hashedPassword]
        );
        res.json({ message: "Admin account created!" });
    } catch (err) {
        res.status(500).json({ message: "Admin already exists or Database error" });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) return res.status(400).json({ message: "Invalid Credentials" });
        
        const user = userResult.rows[0];

        // CHECK PASSWORD FIRST - Prevents blocking users with wrong passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        // SESSION LOCK CHECK
        if (user.role === 'student' && user.is_logged_in) {
            return res.status(403).json({ message: "Session active on another device." });
        }

        await pool.query("UPDATE users SET is_logged_in = TRUE WHERE user_id = $1", [user.user_id]);
        const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "5h" });

        res.json({ token, user: { id: user.user_id, name: user.full_name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Login Error" });
    }
});

app.post('/auth/logout', async (req, res) => {
    try {
        const { userId } = req.body;
        await pool.query("UPDATE users SET is_logged_in = FALSE WHERE user_id = $1", [userId]);
        res.json({ message: "Logged out" });
    } catch (err) {
        res.status(500).send("Logout Error");
    }
});

// --- 2. EXAM & RESULT ROUTES (STUDENT FACING) ---

app.get('/exams', async (req, res) => {
    try {
        const exams = await pool.query("SELECT * FROM exams ORDER BY created_at DESC");
        res.json(exams.rows);
    } catch (err) {
        res.status(500).send("Server Error: Could not fetch exams");
    }
});

app.get('/exams/:id/questions', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        const check = await pool.query(
            "SELECT * FROM results WHERE exam_id = $1 AND user_id = $2", 
            [id, userId]
        );
        if (check.rows.length > 0) return res.status(403).json({ message: "ALREADY_TAKEN" });

        const questions = await pool.query("SELECT * FROM questions WHERE exam_id = $1", [id]);
        res.json(questions.rows);
    } catch (err) {
        res.status(500).send("Error fetching questions");
    }
});

app.post('/results/submit', async (req, res) => {
    try {
        const { user_id, exam_id, score, total_questions } = req.body;
        await pool.query(
            "INSERT INTO results (user_id, exam_id, score, total_questions, submitted_at) VALUES ($1, $2, $3, $4, NOW())",
            [user_id, exam_id, score, total_questions]
        );
        res.json({ message: "Result saved successfully!" });
    } catch (err) {
        res.status(500).send("Error saving result");
    }
});

app.get('/results/student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const results = await pool.query(`
            SELECT r.*, e.title 
            FROM results r 
            JOIN exams e ON r.exam_id = e.exam_id 
            WHERE r.user_id = $1
            ORDER BY r.submitted_at DESC`, 
            [id]
        );
        res.json(results.rows);
    } catch (err) {
        res.status(500).send("Error fetching student results");
    }
});

// --- 3. ADMIN & INSTRUCTOR UPLOADS ---

app.post('/admin/upload-students', upload.single('file'), (req, res) => {
    const results = [];
    if (!req.file) return res.status(400).send("No file uploaded");

    fs.createReadStream(req.file.path)
        .pipe(csv({
            mapHeaders: ({ header }) => header.toLowerCase().replace(/\s+/g, '_').replace('full_name', 'name')
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (let student of results) {
                    if (!student.email || !student.password) continue;
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(student.password, salt);
                    await pool.query(
                        "INSERT INTO users (full_name, email, password_hash, role, department) VALUES ($1, $2, $3, 'student', $4) ON CONFLICT (email) DO NOTHING",
                        [student.name || student.full_name, student.email, hashedPassword, student.department || 'General']
                    );
                }
                res.json({ message: `Successfully processed ${results.length} students.` });
            } catch (err) {
                res.status(500).send("Error saving students");
            } finally {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            }
        });
});

app.post('/exams/upload', upload.single('examFile'), async (req, res) => {
    try {
        const { title, instructor_id } = req.body;
        const newExam = await pool.query(
            "INSERT INTO exams (title, instructor_id) VALUES ($1, $2) RETURNING exam_id",
            [title, instructor_id]
        );
        const examId = newExam.rows[0].exam_id;
        const data = fs.readFileSync(req.file.path, 'utf8');
        const lines = data.split(/\r?\n/);
        
        let currentQ = {};
        for (let line of lines) {
            let cleanLine = line.trim();
            if (!cleanLine) continue;

            if (cleanLine.toUpperCase().startsWith('Q:')) currentQ.text = cleanLine.substring(2).trim();
            else if (cleanLine.toUpperCase().startsWith('A:')) currentQ.a = cleanLine.substring(2).trim();
            else if (cleanLine.toUpperCase().startsWith('B:')) currentQ.b = cleanLine.substring(2).trim();
            else if (cleanLine.toUpperCase().startsWith('C:')) currentQ.c = cleanLine.substring(2).trim();
            else if (cleanLine.toUpperCase().startsWith('D:')) currentQ.d = cleanLine.substring(2).trim();
            else if (cleanLine.toUpperCase().startsWith('ANS:')) {
                currentQ.correct = cleanLine.substring(4).trim();
                if (currentQ.text && currentQ.correct) {
                    await pool.query(
                        "INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                        [examId, currentQ.text, currentQ.a, currentQ.b, currentQ.c, currentQ.d, currentQ.correct]
                    );
                }
                currentQ = {};
            }
        }
        fs.unlinkSync(req.file.path);
        res.json({ message: "Exam uploaded and parsed!" });
    } catch (err) {
        res.status(500).json({ message: "Parsing error" });
    }
});

// --- 4. ADMIN USER MANAGEMENT (FIXED FOR FULL VISIBILITY) ---

app.get('/admin/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT user_id, full_name, email, role, is_logged_in, department 
            FROM users 
            WHERE role IN ('student', 'instructor')
            ORDER BY is_logged_in DESC, full_name ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Admin user fetch error:", err);
        res.status(500).json({ error: "Error fetching users" });
    }
});

app.post('/admin/reset-session/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE users SET is_logged_in = FALSE WHERE user_id = $1 RETURNING full_name", 
            [id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ message: `Session reset for ${result.rows[0].full_name}` });
    } catch (err) {
        console.error("Reset session error:", err);
        res.status(500).json({ error: "Reset failed" });
    }
});

app.get('/admin/exam-stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                e.title,
                u.full_name AS instructor_name,
                COUNT(r.result_id) AS student_count
            FROM exams e
            JOIN users u ON e.instructor_id = u.user_id
            LEFT JOIN results r ON e.exam_id = r.exam_id
            GROUP BY e.exam_id, e.title, u.full_name
            ORDER BY e.exam_id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Admin exam stats fetch error:", err);
        res.status(500).json({ error: "Error fetching exam stats" });
    }
});

app.get('/admin/all-results', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.full_name AS student_name,
                e.title AS exam_title,
                r.score,
                r.submitted_at AS date
            FROM results r
            JOIN users u ON r.user_id = u.user_id
            JOIN exams e ON r.exam_id = e.exam_id
            ORDER BY r.submitted_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Admin results fetch error:", err);
        res.status(500).json({ error: "Error fetching results" });
    }
});

// --- 5. INSTRUCTOR RESULTS MANAGEMENT ---

app.get('/instructor/performance/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        
        const result = await pool.query(`
            SELECT 
                r.result_id AS id,
                u.full_name AS student_name,
                e.title AS exam,
                r.score,
                r.submitted_at AS date
            FROM results r
            JOIN users u ON r.user_id = u.user_id
            JOIN exams e ON r.exam_id = e.exam_id
            WHERE e.instructor_id = $1
            ORDER BY r.submitted_at DESC
        `, [instructorId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error("Instructor performance fetch error:", err);
        res.status(500).json({ error: "Error fetching results" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server active on port ${PORT}`));