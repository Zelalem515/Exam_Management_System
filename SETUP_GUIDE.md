# Quick Setup Guide

## Prerequisites
- Node.js v14+
- PostgreSQL v12+
- Git

## Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd exam-management-system
```

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd server
npm install
```

### 2.2 Create .env File
Create `server/.env` with:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=exam_system
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 2.3 Create Database
```bash
createdb exam_system
```

### 2.4 Run Database Schema
Connect to PostgreSQL and execute the SQL from `EXAM_SYSTEM_DOCUMENTATION.md` (Database Schema section)

### 2.5 Start Server
```bash
npm start
```
Server runs on `http://localhost:5000`

## Step 3: Frontend Setup

### 3.1 Install Dependencies
```bash
cd ../client
npm install
```

### 3.2 Start Frontend
```bash
npm start
```
Frontend opens at `http://localhost:3000`

## Step 4: Initial Configuration

### 4.1 Create Admin Account
1. Navigate to `http://localhost:3000/admin-setup`
2. Fill in admin credentials
3. Click "Create Admin"

### 4.2 Login as Admin
1. Go to `http://localhost:3000/login`
2. Use admin credentials
3. Access admin dashboard

### 4.3 Create Instructor Account
1. Register as instructor through `/register`
2. Or admin can create instructor accounts

### 4.4 Create Exam
1. Login as instructor
2. Upload exam file (see format below) or add questions manually
3. Exam becomes available to students

## Exam File Format

Create a `.txt` file with this format:

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

## CSV Format for Bulk Student Upload

Create a `.csv` file with headers:

```csv
full_name,email,password,department
John Doe,john@example.com,password123,Computer Science
Jane Smith,jane@example.com,password456,Information Technology
```

## Running in Development Mode

### Backend with Auto-Reload
```bash
cd server
npm run dev
```

### Frontend with Hot Reload
```bash
cd client
npm start
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check .env credentials
- Ensure database exists: `createdb exam_system`

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Set PORT=3001 before `npm start`

### Module Not Found
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### CORS Error
- Verify backend is running on port 5000
- Check frontend API URL in components

## Next Steps

1. Read `EXAM_SYSTEM_DOCUMENTATION.md` for complete feature documentation
2. Check `explaining.md` for technical deep-dive
3. Review `bulk_enrollment_logic.md` for CSV enrollment details

## Support

For issues or questions, refer to the documentation files or open an issue on GitHub.
