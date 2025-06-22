
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { PhotoGrid } from "@/components/profile/PhotoGrid";
import { StudentsList } from "./StudentsList";
import StudentProfilePokemonList from "./StudentProfilePokemonList";

interface StudentData {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  photos?: string[];
  classId?: string;
  pokemonCollection?: { id: number; name: string; image: string; type?: string; rarity?: string }[];
  contactInfo?: string;
}

interface ProfileTabsProps {
  student: StudentData;
  isEditing: boolean;
  editData: Partial<StudentData>;
  onEditDataChange: (data: Partial<StudentData>) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  student,
  isEditing,
  editData,
  onEditDataChange
}) => {
  const [isStudentsListOpen, setIsStudentsListOpen] = useState(false);
  
  const handleStudentsAdded = (studentIds: string[]) => {
    console.log("Students added:", studentIds);
    // This is just a placeholder since we're only viewing students in this context
  };

  // Transform the pokemon collection to ensure proper types
  const transformedPokemonCollection = (student.pokemonCollection || []).map(pokemon => ({
    ...pokemon,
    id: typeof pokemon.id === 'string' ? parseInt(pokemon.id) || 0 : pokemon.id
  }));

  return (
    <>
      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="pokemon">Pokémon ({transformedPokemonCollection.length})</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          {student.classId && <TabsTrigger value="classmates">Classmates</TabsTrigger>}
        </TabsList>
        
        {/* Photos Tab */}
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <p className="text-sm text-gray-500">Upload up to 4 photos</p>
            </CardHeader>
            <CardContent>
              <PhotoGrid 
                photos={isEditing ? editData.photos || [] : student.photos || []}
                maxPhotos={4}
                editable={isEditing}
                onPhotosChange={photos => onEditDataChange({...editData, photos})}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pokemon Tab */}
        <TabsContent value="pokemon">
          <Card>
            <CardHeader>
              <CardTitle>Pokémon Collection</CardTitle>
              <p className="text-sm text-gray-500">
                {transformedPokemonCollection.length} Pokémon collected
              </p>
            </CardHeader>
            <CardContent>
              <StudentProfilePokemonList pokemons={transformedPokemonCollection} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contact Info Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isEditing ? (
                  <div>
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Input
                      id="contactInfo"
                      placeholder="Add your contact information"
                      value={editData.contactInfo || ''}
                      onChange={(e) => onEditDataChange({...editData, contactInfo: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <p>
                    {student.contactInfo ? (
                      student.contactInfo
                    ) : (
                      <span className="text-gray-400">No contact information provided</span>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classmates Tab */}
        {student.classId && (
          <TabsContent value="classmates">
            <Card>
              <CardHeader>
                <CardTitle>Classmates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setIsStudentsListOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-5 w-5" />
                    View Class Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {student.classId && (
        <StudentsList 
          classId={student.classId}
          open={isStudentsListOpen}
          onOpenChange={setIsStudentsListOpen}
          onStudentsAdded={handleStudentsAdded}
          viewMode={true}
        />
      )}
    </>
  );
};
