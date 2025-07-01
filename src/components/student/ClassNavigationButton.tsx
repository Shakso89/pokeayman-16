
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ClassNavigationButtonProps {
  classId: string;
  className?: string;
  children: React.ReactNode;
}

const ClassNavigationButton: React.FC<ClassNavigationButtonProps> = ({
  classId,
  className,
  children
}) => {
  const navigate = useNavigate();

  const handleViewClass = () => {
    if (classId && classId !== 'undefined') {
      navigate(`/class/${classId}`);
    } else {
      console.error('Invalid class ID for navigation:', classId);
    }
  };

  return (
    <Button onClick={handleViewClass} className={className}>
      {children}
    </Button>
  );
};

export default ClassNavigationButton;
