# PERN Exam Management System

A comprehensive online exam management platform built with React, Node.js, Express, and PostgreSQL. This system enables instructors to create and manage exams, students to take secure exams, and administrators to oversee the entire system.

**Developer:** Zelalem Birhan | DTU IT Student


## Features

### 🎓 Student Features
- Secure exam taking with copy-paste prevention
- 30-minute timer with auto-save functionality
- Fullscreen mode enforcement
- Tab switch detection with warning system
- View past exam results and scores
- Session lock prevents multiple simultaneous logins

### 👨‍🏫 Instructor Features
- Upload exams via .txt file format
- Add questions manually through UI
- View student performance tracking dashboard
- See all student results with names, scores, and submission dates
- Track submission timestamps
- Secure logout functionality

### 🔐 Admin Features
- Manage all users (students and instructors)
- View system statistics and exam analytics
- Reset user sessions
- View all exam results system-wide
- Bulk upload students via CSV

### 🛡️ Security Features
- Password hashing with bcryptjs
- JWT token authentication (5-hour expiration)
- Copy-paste prevention during exams
- Right-click context menu disabled
- Keyboard shortcuts blocked (Ctrl+C, Ctrl+V, F12, etc.)
- Text selection prevention
- Fullscreen mode enforcement
- Tab switch detection with auto-submit on 3rd warning
- Session locking for students
- UPSERT logic prevents duplicate enrollments

## Tech Stack

### Frontend
- React.js 19.2.4
- React Router DOM 7.13.2
- Axios 1.13.6
- CSS3 for styling

### Backend
- Node.js with Express.js 5.2.1
- PostgreSQL database
- JWT for authentication
- Bcryptjs for password hashing
- Multer for file uploads
- CSV-Parser for bulk enrollment

### Development Tools
- Nodemon for auto-reload
- CORS for cross-origin requests
- Dotenv for environment variables

## Project Structure

```
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── AdminRegister.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── InstructorDashboard.js
│   │   │   ├── StudentDashboard.js
│   │   │   └── TakeExam.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── index.js                     # Main server file
│   ├── db.js                        # Database connection
│   ├── .env                         # Environment variables
│   ├── uploads/                     # Temporary file storage
│   └── package.json
│
├── EXAM_SYSTEM_DOCUMENTATION.md     # Complete system documentation
├── explaining.md                    # Technical deep-dive
└── README.md                        # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/Zelalem515/Exam_Management_System.git
cd Exam_Management_System
```

2. **Follow the SETUP_GUIDE.md** for detailed installation steps

### Backend Setup

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=exam_system
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key_here
PORT=5000
```

4. **Create PostgreSQL database:**
```bash
createdb exam_system
```

5. **Run database schema** (execute SQL from EXAM_SYSTEM_DOCUMENTATION.md)

6. **Start the server:**
```bash
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**
```bash
cd client
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

Frontend will open at `http://localhost:3000`

## Usage

### First-Time Setup

1. **Create Admin Account:**
   - Navigate to `http://localhost:3000/admin-setup`
   - Fill in admin credentials
   - This creates the first admin account

2. **Login as Admin:**
   - Go to `http://localhost:3000/login`
   - Use admin credentials
   - Access admin dashboard

3. **Upload Students (Optional):**
   - In admin dashboard, upload CSV with student data
   - CSV format: `full_name, email, password, department`

4. **Create Instructor Account:**
   - Register as instructor through `/register`
   - Or admin can create instructor accounts

5. **Create Exams:**
   - Login as instructor
   - Upload exam file or add questions manually
   - Exams become available to students

### Exam File Format (.txt)

```
Q: What is the capital of France?
A: London
B: Paris
C: Berlin
D: Madrid
Ans: B

Q: What is 2+2?
A: 3
B: 4
C: 5
D: 6
Ans: B
```

### CSV Format for Bulk Student Upload

```csv
full_name,email,password,department
Zelalem Birhan,zed@example.com,password123,Computer Science
Abebe Alemu,abebe@example.com,password456,Information Technology
```

## API Endpoints

### Authentication
- `POST /auth/register-admin` - Create admin account
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Exams
- `GET /exams` - Get all exams
- `GET /exams/:id/questions` - Get exam questions
- `POST /exams/upload` - Upload exam file
- `POST /exams/manual` - Add question manually

### Results
- `POST /results/submit` - Submit exam
- `GET /results/student/:id` - Get student results
- `GET /instructor/performance/:instructorId` - Get instructor's student results

### Admin
- `GET /admin/users` - Get all users
- `POST /admin/reset-session/:id` - Reset user session
- `GET /admin/exam-stats` - Get exam statistics
- `GET /admin/all-results` - Get all results
- `POST /admin/upload-students` - Bulk upload students

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_logged_in BOOLEAN DEFAULT FALSE,
    department VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Exams Table
```sql
CREATE TABLE exams (
    exam_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    instructor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id)
);
```

### Questions Table
```sql
CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255),
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_option VARCHAR(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id)
);
```

### Results Table
```sql
CREATE TABLE results (
    result_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id)
);
```

## Security Considerations

1. **Always use HTTPS** in production
2. **Rotate JWT secrets** regularly
3. **Use strong database passwords**
4. **Validate all inputs** on backend
5. **Sanitize user data** before storing
6. **Keep dependencies updated**
7. **Monitor exam submissions** for anomalies
8. **Use environment variables** for sensitive data
9. **Implement rate limiting** on API endpoints
10. **Regular security audits** of codebase

## Troubleshooting

### Issue: "No students have submitted exams yet"
- Verify students have actually submitted exams
- Check instructor_id matches in exams table
- Verify backend is running on port 5000
- Check browser console for API errors

### Issue: "Session active on another device"
- Admin can reset session from admin dashboard
- User must logout from other device first
- Clear browser cache and localStorage

### Issue: Exam timer not working
- Check browser console for errors
- Verify localStorage is enabled
- Refresh page to recover timer from localStorage

### Issue: Copy-paste still works
- Ensure TakeExam.js has security listeners
- Check browser console for JavaScript errors
- Some browser extensions may override security

## Documentation

- **EXAM_SYSTEM_DOCUMENTATION.md** - Complete system documentation with all features, routes, and setup instructions
- **explaining.md** - Technical deep-dive into system architecture, state management, and workflows
- **bulk_enrollment_logic.md** - Detailed explanation of CSV bulk enrollment process

## Future Enhancements

- [ ] Email notifications for exam submissions
- [ ] Question bank management
- [ ] Exam scheduling
- [ ] Detailed analytics and reports
- [ ] Mobile app support
- [ ] Proctoring with webcam
- [ ] Question randomization per student
- [ ] Partial credit scoring
- [ ] Exam review after submission
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## About This Project

This is a comprehensive **PERN Stack mini project** that demonstrates practical implementation of:
- PostgreSQL database design and optimization
- Express.js backend API development
- React.js frontend development
- Node.js server-side programming
- Full-stack authentication and security

Perfect for learning full-stack web development with a real-world exam management use case.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Version:** 1.0.0  
**Last Updated:** March 2026  
**Project Type:** PERN Stack Mini Project
