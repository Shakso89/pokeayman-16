
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useClassDetailsWithId } from "./hooks/useClassDetailsWithId";
import ClassManagementHeader from "./ClassManagementHeader";
import StudentsTable from "./StudentsTable";
import ClassTabs from "./ClassTabs";
import ClassDialogs from "./ClassDialogs";
import AddAssistantDialog from "./AddAssistantDialog";
import { motion } from "framer-motion";

const ClassDetailsContainer: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [activeTab, setActiveTab] = useState("students");
  const [isAddAssistantOpen, setIsAddAssistantOpen] = useState(false);

  const {
    classData,
    loading,
    error,
    students,
    pendingSubmissions,
    isClassCreator,
    dialogs,
    handlers
  } = useClassDetailsWithId(classId || "");

  const handleAssistantAdded = () => {
    // Refresh class data or show success message
    console.log("Assistant added successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading class details...</div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">
          {error || "Class not found"}
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    >
      <motion.div variants={itemVariants}>
        <ClassManagementHeader
          classData={classData}
          studentsCount={students.length}
          isClassCreator={isClassCreator}
          onAddStudent={handlers.handleAddStudent}
          onSwitchToHomework={() => setActiveTab("homework")}
          pendingSubmissions={pendingSubmissions}
          onManagePokemon={handlers.handleManagePokemon}
          onViewSchoolPool={handlers.handleViewSchoolPool}
          onAddAssistant={() => setIsAddAssistantOpen(true)}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        <motion.div variants={itemVariants}>
          <ClassTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          {activeTab === "students" && (
            <StudentsTable
              students={students}
              isClassCreator={isClassCreator}
              onAwardCoins={handlers.handleAwardCoins}
              onManagePokemon={handlers.handleManagePokemon}
              onRemoveStudent={handlers.handleRemoveStudent}
              onAddStudent={handlers.handleAddStudent}
              classData={classData}
              onRemoveCoins={handlers.handleRemoveCoins}
              onRemovePokemon={handlers.handleRemovePokemon}
            />
          )}
        </motion.div>
      </div>

      <ClassDialogs
        dialogs={dialogs}
        handlers={handlers}
        classData={classData}
        students={students}
      />

      <AddAssistantDialog
        isOpen={isAddAssistantOpen}
        onOpenChange={setIsAddAssistantOpen}
        classId={classId || ""}
        className={classData.name}
        onAssistantAdded={handleAssistantAdded}
      />
    </motion.div>
  );
};

export default ClassDetailsContainer;
