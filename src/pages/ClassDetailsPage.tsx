
import React from "react";
import ClassPageLayout from "@/components/layouts/ClassPageLayout";
import ClassDetailsContainer from "@/components/class-details/ClassDetailsContainer";

const ClassDetailsPage: React.FC = () => {
  return (
    <ClassPageLayout userType="teacher" userName="Teacher">
      <ClassDetailsContainer />
    </ClassPageLayout>
  );
};

export default ClassDetailsPage;
