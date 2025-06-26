
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage';
import TeacherLogin from '@/pages/TeacherLogin';
import StudentLogin from '@/pages/StudentLogin';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import ClassDetails from '@/pages/ClassDetails';
import StudentDetailPage from '@/pages/StudentDetailPage';
import StudentProfilePage from '@/pages/StudentProfilePage';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute userType="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/class/:classId" element={
          <ProtectedRoute userType="teacher">
            <ClassDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/student/:studentId" element={
          <ProtectedRoute userType="teacher">
            <StudentDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/student-dashboard" element={
          <ProtectedRoute userType="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student-profile" element={
          <ProtectedRoute userType="student">
            <StudentProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
