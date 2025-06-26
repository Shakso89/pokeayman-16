
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import TeacherLogin from '@/pages/TeacherLogin';
import StudentLogin from '@/pages/StudentLogin';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import ClassDetailsPage from '@/pages/ClassDetailsPage';
import StudentDetailPage from '@/pages/StudentDetailPage';
import StudentProfilePage from '@/pages/StudentProfilePage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute requiredUserType="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/class/:classId" element={
          <ProtectedRoute requiredUserType="teacher">
            <ClassDetailsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/student/:studentId" element={
          <ProtectedRoute requiredUserType="teacher">
            <StudentDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/student-dashboard" element={
          <ProtectedRoute requiredUserType="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student-profile" element={
          <ProtectedRoute requiredUserType="student">
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
