import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudentsGridProps {
  students: any[];
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onRemoveCoins: (studentId: string, studentName: string) => void;
  onRemovePokemon: (studentId: string, studentName: string) => void;
  classData: any;
}

const StudentsGrid = ({
  students,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onRemoveCoins,
  onRemovePokemon,
  classData,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {students.map((student) => (
        <Card
          key={student.id}
          className="flex flex-col items-center justify-between gap-2 p-4"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl text-gray-400">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none"><circle cx="12" cy="8" r="4" stroke="#cbd5e1" strokeWidth="2" /><path d="M21 21c0-4-3.582-7-9-7s-9 3-9 7" stroke="#cbd5e1" strokeWidth="2" /></svg>
              </span>
            </div>
            <span className="font-bold text-lg">{student.display_name || student.displayName || student.username}</span>
            <span className="text-gray-500 text-sm">@{student.username}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-2 w-full">
            <div className="bg-yellow-100 rounded-lg px-2 py-1 flex flex-col items-center">
              <span className="text-yellow-800 font-semibold">🪙 Coins</span>
              <span className="text-lg">{student.coins ?? 0}</span>
            </div>
            <div className="bg-purple-100 rounded-lg px-2 py-1 flex flex-col items-center">
              <span className="text-purple-800 font-semibold">🪄 Pokémon</span>
              <span className="text-lg">{student.pokemonCount ?? 0}</span>
            </div>
          </div>
          <div className="w-full my-2 border-t"></div>
          <div className="flex gap-2 w-full justify-between mt-2">
            <Button
              size="sm"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => onAwardCoins(student.id, student.display_name || student.username)}
            >
              Coins
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gray-100"
              onClick={() => onRemoveCoins(student.id, student.display_name || student.username)}
            >
              – Coins
            </Button>
          </div>
          <Button
            size="sm"
            className="w-full my-1 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => onManagePokemon(student.id, student.display_name || student.username, classData.schoolId)}
          >
            Manage Pokémon
          </Button>
          <Button
            size="sm"
            className="w-full bg-red-500 hover:bg-red-600 text-white mt-1"
            onClick={() => onRemoveStudent(student.id, student.display_name || student.username)}
          >
            <span>🗑</span> Remove Student
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default StudentsGrid;
