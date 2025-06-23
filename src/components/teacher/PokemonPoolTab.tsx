
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Award } from "lucide-react";
import PokemonPoolDisplay from "@/components/PokemonPoolDisplay";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";

interface PokemonPoolTabProps {
  classId?: string;
  students?: Array<{ id: string; username: string; display_name?: string }>;
}

const PokemonPoolTab: React.FC<PokemonPoolTabProps> = ({ classId, students = [] }) => {
  const { t } = useTranslation();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    (student.display_name && student.display_name.toLowerCase().includes(studentSearchTerm.toLowerCase()))
  );

  const handleAwardPokemon = (pokemonId: string, pokemonName: string) => {
    setIsAwardDialogOpen(false);
    setSelectedStudent("");
  };

  return (
    <div className="space-y-6">
      {/* Header with Award Action */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🎯 Pokémon Pool
              <Badge variant="outline">Global Collection</Badge>
            </CardTitle>
            {students.length > 0 && (
              <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Award Pokémon to Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Award Pokémon to Student</DialogTitle>
                  </DialogHeader>
                  
                  {/* Student Selection */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {filteredStudents.map((student) => (
                        <Button
                          key={student.id}
                          variant={selectedStudent === student.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedStudent(student.id)}
                          className="justify-start text-xs"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {student.display_name || student.username}
                        </Button>
                      ))}
                    </div>
                    
                    {selectedStudent && (
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-sm">
                          Selected: {filteredStudents.find(s => s.id === selectedStudent)?.display_name || 
                                   filteredStudents.find(s => s.id === selectedStudent)?.username}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pokémon Pool */}
                  <div className="flex-1 overflow-y-auto">
                    <PokemonPoolDisplay
                      showActions={!!selectedStudent}
                      studentId={selectedStudent}
                      onAwardPokemon={handleAwardPokemon}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">300</div>
              <div className="text-sm text-gray-600">Total Pokémon Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold">🌍</div>
              <div className="text-sm text-gray-600">Global Unified Pool</div>
            </div>
            <div>
              <div className="text-2xl font-bold">♾️</div>
              <div className="text-sm text-gray-600">Unlimited Collection</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>New Unified System:</strong> All teachers and students now share the same pool of 300 unique Pokémon. 
              Students can collect unlimited copies, and teachers can award any Pokémon from this global collection.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pokémon Pool Display */}
      <PokemonPoolDisplay />
    </div>
  );
};

export default PokemonPoolTab;
