# PERN Exam Management System - Complete Documentation

**Project Type:** PERN Stack Mini Project

## Overview
This is a comprehensive exam management system built with React (frontend) and Node.js/Express (backend) that allows instructors to create and manage exams, and students to take them securely. The system includes robust security features to maintain academic integrity.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Features](#features)
3. [Security Implementation](#security-implementation)
4. [Backend Routes](#backend-routes)
5. [Frontend Components](#frontend-components)
6. [Database Schema](#database-schema)
7. [Setup Instructions](#setup-instructions)

---

## System Architecture

### Tech Stack
- **Frontend:** React.js, Axios, React Router
- **Backend:** Node.js, Express.js, PostgreSQL
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **File Upload:** Multer
- **Environment:** .env configuration

### Project Structure
```
├── client/
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
│   │   └── index.js
│   └── package.json
├── server/
│   ├── index.js
│   ├── db.js
│   ├── .env
│   ├── package.json
│   └── uploads/
```

---

## Features

### 1. User Roles & Authentication
- **Admin:** Manages users, views system statistics, resets sessions
- **Instructor:** Creates exams, uploads questions, tracks student performance
- **Student:** Takes exams, views results, manages profile

### 2. Exam Management
- **File Upload:** Instructors can upload .txt files with exam questions
- **Manual Entry:** Add questions one by one through the UI
- **Question Format:** Multiple choice (A, B, C, D options)
- **Exam Tracking:** View student performance and submission dates

### 3. Student Performance Tracking
- **Performance Dashboard:** Instructors see all student results for their exams
- **Detailed Metrics:** Student name, exam title, score, submission date
- **Real-time Updates:** Results appear immediately after submission

### 4. Session Management
- **Single Session Lock:** Prevents students from taking exams on multiple devices
- **Session Reset:** Admins can reset locked sessions
- **Auto-Logout:** Proper cleanup on logout

---

## Security Implementation

### Frontend Security (TakeExam.js)

#### 1. Copy-Paste Prevention
Blocks all copy, cut, and paste events to prevent exam content theft.

#### 2. Right-Click Prevention
Disables context menu to prevent access to developer tools.

#### 3. Keyboard Shortcuts Blocked
- Ctrl+C / Cmd+C - Copy
- Ctrl+X / Cmd+X - Cut
- Ctrl+V / Cmd+V - Paste
- Ctrl+U / Cmd+U - View Source
- F12 - Inspect Element

#### 4. Text Selection Prevention
CSS property `user-select: none` prevents text highlighting.

#### 5. Fullscreen Mode
Exam automatically enters fullscreen when started.

#### 6. Tab Switch Detection
Detects when student switches tabs with warning system (3 warnings = auto-submit).

#### 7. Auto-Save & Recovery
Answers saved to localStorage every change, timer saved every second.

### Backend Security

#### 1. Password Hashing
Uses bcryptjs with salt rounds for secure password storage.

#### 2. JWT Authentication
Tokens expire after 5 hours for security.

#### 3. Session Locking
Prevents multiple simultaneous sessions for students.

#### 4. Exam Submission Validation
Checks if student already submitted exam to prevent duplicates.

---

## Backend Routes

### Authentication Routes

#### POST `/auth/register-admin`
Creates an admin account

#### POST `/auth/login`
Authenticates user and returns JWT token

#### POST `/auth/logout`
Clears user session

### Exam Routes

#### GET `/exams`
Fetches all available exams

#### GET `/exams/:id/questions`
Fetches questions for a specific exam

#### POST `/results/submit`
Submits exam results

#### GET `/results/student/:id`
Fetches all results for a student

### Instructor Routes

#### GET `/instructor/performance/:instructorId`
Fetches all student results for instructor's exams

### Admin Routes

#### GET `/admin/users`
Fetches all students and instructors

#### POST `/admin/reset-session/:id`
Resets a user's session lock

#### GET `/admin/exam-stats`
Fetches exam statistics

#### GET `/admin/all-results`
Fetches all exam results system-wide

### File Upload Routes

#### POST `/admin/upload-students`
Uploads CSV file with student data

#### POST `/exams/upload`
Uploads exam questions from .txt file

---

## Frontend Components

### Login.js
User authentication with role-based redirect

### Register.js
Student registration with email validation

### AdminRegister.js
Admin account creation (one-time setup)

### StudentDashboard.js
View available exams and past results

### InstructorDashboard.js
Upload exams, add questions, view student performance

### AdminDashboard.js
Manage users, view statistics, reset sessions

### TakeExam.js
Secure exam interface with security listeners

---

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

---

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- npm or yarn

### Backend Setup

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Create .env file:**
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=exam_system
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key
PORT=5000
```

3. **Create PostgreSQL database:**
```sql
CREATE DATABASE exam_system;
```

4. **Run database schema** (execute the SQL from Database Schema section)

5. **Start server:**
```bash
npm start
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd client
npm install
```

2. **Start development server:**
```bash
npm start
```

3. **Access application:**
- Open http://localhost:3000 in browser

### First-Time Setup

1. **Create Admin Account:**
   - Navigate to http://localhost:3000/admin-setup
   - Fill in admin credentials

2. **Login as Admin:**
   - Go to http://localhost:3000/login
   - Use admin credentials

3. **Upload Students:**
   - In admin dashboard, upload CSV with student data

4. **Create Instructor Account:**
   - Register as instructor through /register

5. **Create Exams:**
   - Login as instructor
   - Upload exam file or add questions manually

---

## Usage Workflow

### For Students
1. Register account
2. Login to dashboard
3. View available exams
4. Click "Take Exam"
5. Answer questions (auto-saved)
6. Submit exam before time runs out
7. View score and results

### For Instructors
1. Register as instructor
2. Login to dashboard
3. Upload exam file (or add questions manually)
4. Students take exam
5. View "Student Performance Tracking" table
6. See all student results with scores and dates

### For Admins
1. Create admin account (one-time)
2. Login to admin dashboard
3. Manage users (view, reset sessions)
4. View system statistics
5. View all exam results

---

## Troubleshooting

### Issue: "No students have submitted exams yet"
**Solution:** 
- Verify students have actually submitted exams
- Check instructor_id matches in exams table
- Verify backend is running on port 5000

### Issue: "Session active on another device"
**Solution:**
- Admin can reset session from admin dashboard
- User must logout from other device first

### Issue: Exam timer not working
**Solution:**
- Check browser console for errors
- Verify localStorage is enabled
- Refresh page to recover timer

### Issue: Copy-paste still works
**Solution:**
- Ensure TakeExam.js has security listeners
- Check browser console for JavaScript errors

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate JWT secrets** regularly
3. **Use strong passwords** for database
4. **Validate all inputs** on backend
5. **Sanitize user data** before storing
6. **Keep dependencies updated**
7. **Monitor exam submissions** for anomalies
8. **Use environment variables** for sensitive data
9. **Implement rate limiting** on API endpoints
10. **Regular security audits** of codebase

---

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

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Project Type:** PERN Stack Mini Project
