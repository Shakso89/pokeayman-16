import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Award, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAllPokemon,
  getStudentPokemonCollection,
  awardPokemonToStudent,
  removePokemonFromStudent,
  getClassStudents,
  type Pokemon,
  type StudentPokemon,
  type StudentData
} from '@/services/pokemonManagementService';
import PokemonAwardGrid from '@/components/pokemon/PokemonAwardGrid';
import StudentPokemonGrid from '@/components/pokemon/StudentPokemonGrid';

interface StudentPokemonManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onRefresh?: () => void;
}

const StudentPokemonManagerDialog: React.FC<StudentPokemonManagerDialogProps> = ({
  isOpen,
  onOpenChange,
  classId,
  onRefresh
}) => {
  // State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [studentPokemon, setStudentPokemon] = useState<StudentPokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'award' | 'manage'>('award');

  const { toast } = useToast();

  // Load initial data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, classId]);

  // Load student's Pokemon when student is selected
  useEffect(() => {
    if (selectedStudentId) {
      loadStudentPokemon();
    } else {
      setStudentPokemon([]);
    }
  }, [selectedStudentId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [studentsData, pokemonData] = await Promise.all([
        getClassStudents(classId),
        getAllPokemon()
      ]);
      
      setStudents(studentsData);
      setAllPokemon(pokemonData);
      
      console.log(`✅ Loaded ${studentsData.length} students and ${pokemonData.length} Pokemon`);
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentPokemon = async () => {
    if (!selectedStudentId) return;

    try {
      const pokemonData = await getStudentPokemonCollection(selectedStudentId);
      setStudentPokemon(pokemonData);
    } catch (error) {
      console.error('❌ Error loading student Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student's Pokemon collection."
      });
    }
  };

  const handleAwardPokemon = async (pokemonId: string, pokemonName: string) => {
    if (!selectedStudentId) {
      toast({
        variant: "destructive",
        title: "No Student Selected",
        description: "Please select a student first."
      });
      return;
    }

    setLoading(true);
    try {
      await awardPokemonToStudent(selectedStudentId, pokemonId, 'teacher_award');
      
      toast({
        title: "Pokemon Awarded!",
        description: `${pokemonName} has been awarded to the student.`
      });

      // Refresh student's collection
      await loadStudentPokemon();
      onRefresh?.();

    } catch (error) {
      console.error('❌ Error awarding Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Award Failed",
        description: error instanceof Error ? error.message : "Failed to award Pokemon."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePokemon = async (collectionId: string, pokemonName: string) => {
    setLoading(true);
    try {
      await removePokemonFromStudent(collectionId);
      
      toast({
        title: "Pokemon Removed",
        description: `${pokemonName} has been removed from the student's collection.`
      });

      // Refresh student's collection
      await loadStudentPokemon();
      onRefresh?.();

    } catch (error) {
      console.error('❌ Error removing Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Removal Failed",
        description: error instanceof Error ? error.message : "Failed to remove Pokemon."
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter Pokemon based on search term
  const filteredPokemon = allPokemon.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pokemon.type_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pokemon.type_2 && pokemon.type_2.toLowerCase().includes(searchTerm.toLowerCase())) ||
    pokemon.rarity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find(s => s.user_id === selectedStudentId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Student Pokemon</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Student Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.display_name || student.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedStudent && (
              <div className="text-sm text-muted-foreground">
                {studentPokemon.length} Pokemon in collection
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'award' | 'manage')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="award" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Award Pokemon
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Manage Collection
              </TabsTrigger>
            </TabsList>

            {/* Award Pokemon Tab */}
            <TabsContent value="award" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search Pokemon by name, type, or rarity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Pokemon Grid */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <PokemonAwardGrid
                    pokemon={filteredPokemon}
                    onAward={handleAwardPokemon}
                    disabled={!selectedStudentId || loading}
                  />
                )}
              </div>
            </TabsContent>

            {/* Manage Collection Tab */}
            <TabsContent value="manage" className="space-y-4">
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : !selectedStudentId ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Please select a student to view their Pokemon collection.
                  </div>
                ) : (
                  <StudentPokemonGrid
                    pokemon={studentPokemon}
                    onRemove={handleRemovePokemon}
                    disabled={loading}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPokemonManagerDialog;