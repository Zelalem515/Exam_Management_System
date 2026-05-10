import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Component Imports
import Login from './components/Login';
import Register from './components/Register';
import AdminRegister from './components/AdminRegister'; // Ensure this file exists
import InstructorDashboard from './components/InstructorDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TakeExam from './components/TakeExam';

function App() {
  // Initialize user from localStorage so you don't lose the session on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Watch for user state changes and save to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        
        {/* --- Setup Route (Use this once to create your admin) --- */}
        <Route path="/admin-setup" element={<AdminRegister />} />
        
        {/* --- Protected Admin Route --- */}
        <Route 
          path="/admin-dashboard" 
          element={
            user?.role === 'admin' ? <AdminDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />
          } 
        />

        {/* --- Protected Instructor Route --- */}
        <Route 
          path="/instructor-dashboard" 
          element={
            user?.role === 'instructor' ? <InstructorDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />
          } 
        />

        {/* --- Protected Student Routes --- */}
        <Route 
          path="/dashboard" 
          element={
            user?.role === 'student' ? <StudentDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/take-exam/:id" 
          element={
            user?.role === 'student' ? <TakeExam user={user} /> : <Navigate to="/login" />
          } 
        />

        {/* --- Default Redirect Logic --- */}
        <Route 
          path="/" 
          element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin-dashboard" /> :
              user.role === 'instructor' ? <Navigate to="/instructor-dashboard" /> :
              <Navigate to="/dashboard" />
            ) : <Navigate to="/login" />
          } 
        />

        {/* Catch-all for 404s */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;