
import React from 'react';
import { useParams } from 'react-router-dom';
import ClassManagement from '@/components/teacher/class-management/ClassManagement';

const ClassManagementPage: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();

  return (
    <ClassManagement
      onBack={() => window.history.back()}
      schoolId=""
      teacherId={teacherId || ""}
    />
  );
};

export default ClassManagementPage;
