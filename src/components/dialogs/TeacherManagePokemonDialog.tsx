
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getStudentPokemonCollection, 
  awardPokemonToStudent, 
  removePokemonFromStudent,
  type StudentPokemonCollectionItem 
} from '@/services/pokemonService';
import { StudentProfile } from '@/services/studentDatabase';
import PokemonPoolDisplay from '@/components/PokemonPoolDisplay';

interface ManagePokemonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentProfile[];
  schoolId: string;
  classId: string;
  isClassCreator: boolean;
  onRefresh: () => void;
}

const TeacherManagePokemonDialog: React.FC<ManagePokemonDialogProps> = ({
  isOpen,
  onOpenChange,
  students,
  schoolId,
  classId,
  isClassCreator,
  onRefresh
}) => {
  const [studentId, setStudentId] = useState<string>('');
  const [studentPokemons, setStudentPokemons] = useState<StudentPokemonCollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'award' | 'remove'>('award');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && studentId) {
      loadStudentPokemon();
    }
  }, [isOpen, studentId]);

  const loadStudentPokemon = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading student Pokemon collection for:', studentId);
      
      const collections = await getStudentPokemonCollection(studentId);
      console.log('📦 Student collections found:', collections.length);
      
      setStudentPokemons(collections);
      console.log('✅ Pokemon collection loaded:', collections.length);
    } catch (error) {
      console.error('❌ Error loading student Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student's Pokémon collection"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePokemon = async (pokemon: StudentPokemonCollectionItem) => {
    if (!pokemon.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot remove Pokémon - missing collection ID"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🗑️ Removing Pokemon collection:', pokemon.id);
      
      const success = await removePokemonFromStudent(pokemon.id);

      if (success) {
        toast({
          title: "Success",
          description: `${pokemon.pokemon_pool?.name || 'Pokemon'} removed from student's collection`
        });
        
        await loadStudentPokemon();
        onRefresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove Pokémon"
        });
      }
    } catch (error) {
      console.error('❌ Error removing Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while removing Pokémon"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAwardPokemon = async (pokemonId: string, pokemonName: string) => {
    if (!studentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student first"
      });
      return;
    }

    console.log('🎁 Awarding Pokemon from dialog:', { pokemonId, pokemonName, studentId });
    
    // Refresh the collection after awarding
    await loadStudentPokemon();
    onRefresh();
    
    toast({
      title: "Success",
      description: `${pokemonName} awarded to student successfully!`
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500';
      case 'rare': return 'bg-purple-500';
      case 'uncommon': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'shop_purchase': return 'bg-green-100 text-green-800';
      case 'teacher_award': return 'bg-blue-100 text-blue-800';
      case 'mystery_ball': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'shop_purchase': return 'Shop';
      case 'teacher_award': return 'Award';
      case 'mystery_ball': return 'Mystery';
      default: return source;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Student Pokémon</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Action Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "award" ? "default" : "outline"}
              onClick={() => setActiveTab("award")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Award Pokémon
            </Button>
            <Button
              variant={activeTab === "remove" ? "default" : "outline"}
              onClick={() => setActiveTab("remove")}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove Pokémon
            </Button>
          </div>

          {/* Student Selection */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
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
          </div>

          {/* Content based on active tab */}
          {activeTab === "award" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Award Pokémon</h3>
              <PokemonPoolDisplay
                showActions={!!studentId}
                studentId={studentId}
                onAwardPokemon={handleAwardPokemon}
              />
            </div>
          )}

          {activeTab === "remove" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Current Collection ({studentPokemons.length} Pokémon)
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading collection...</p>
                </div>
              ) : studentPokemons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {studentId ? "Student doesn't have any Pokémon yet." : "Please select a student to view their collection."}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {studentPokemons.map((pokemon) => (
                    <Card key={pokemon.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2">
                            <Badge 
                              variant="outline" 
                              className={`${getRarityColor(pokemon.pokemon_pool?.rarity || 'common')} text-white`}
                            >
                              {pokemon.pokemon_pool?.rarity || 'common'}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getSourceColor(pokemon.source)}`}
                            >
                              {getSourceLabel(pokemon.source)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePokemon(pokemon)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {pokemon.pokemon_pool?.image_url && (
                          <div className="mb-2">
                            <img 
                              src={pokemon.pokemon_pool.image_url} 
                              alt={pokemon.pokemon_pool.name}
                              className="w-full h-32 object-contain bg-gray-50 rounded"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                        )}
                        
                        <h4 className="font-medium text-sm">{pokemon.pokemon_pool?.name || 'Unknown Pokemon'}</h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {pokemon.pokemon_pool?.type_1}{pokemon.pokemon_pool?.type_2 ? `/${pokemon.pokemon_pool.type_2}` : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Added: {new Date(pokemon.awarded_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherManagePokemonDialog;
