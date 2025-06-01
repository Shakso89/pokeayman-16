
import React from "react";
import { HomeworkSubmission, HomeworkAssignment } from "@/types/homework";
import { Badge } from "@/components/ui/badge";

interface MultipleChoiceReviewProps {
  submission: HomeworkSubmission;
  homework: HomeworkAssignment;
}

export const MultipleChoiceReview: React.FC<MultipleChoiceReviewProps> = ({
  submission,
  homework
}) => {
  if (!homework.questions || !submission.answers) return null;

  return (
    <div className="space-y-4">
      {homework.questions.map((question, qIndex) => {
        const studentAnswers = submission.answers?.[qIndex] || [];
        const correctAnswers = question.correctAnswers;
        const isCorrect = correctAnswers.every(ca => studentAnswers.includes(ca)) && 
                         studentAnswers.every(sa => correctAnswers.includes(sa));

        return (
          <div key={question.id} className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">{question.question}</h4>
            <div className="space-y-2">
              {question.options.map((option, oIndex) => {
                const isSelected = studentAnswers.includes(oIndex);
                const isCorrect = correctAnswers.includes(oIndex);
                
                return (
                  <div 
                    key={oIndex} 
                    className={`p-2 rounded flex items-center justify-between ${
                      isSelected && isCorrect ? 'bg-green-100 text-green-800' :
                      isSelected && !isCorrect ? 'bg-red-100 text-red-800' :
                      !isSelected && isCorrect ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-50'
                    }`}
                  >
                    <span>{option}</span>
                    <div className="flex gap-1">
                      {isSelected && <Badge variant="outline">Selected</Badge>}
                      {isCorrect && <Badge variant="outline" className="bg-green-100">Correct</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2">
              <Badge variant={isCorrect ? "default" : "destructive"}>
                {isCorrect ? "Correct" : "Incorrect"}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};
