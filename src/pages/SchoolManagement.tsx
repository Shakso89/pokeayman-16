
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SchoolManagement from '@/components/teacher/SchoolManagement';

const SchoolManagementPage: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();

  return (
    <SchoolManagement
      onBack={() => navigate('/teacher-dashboard')}
      onSelectSchool={(schoolId) => navigate(`/teacher/class-management/${teacherId}?schoolId=${schoolId}`)}
      teacherId={teacherId || ""}
    />
  );
};

export default SchoolManagementPage;
