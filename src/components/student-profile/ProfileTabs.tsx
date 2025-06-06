
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { PhotoGrid } from "@/components/profile/PhotoGrid";
import { StudentsList } from "./StudentsList";

interface StudentData {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  photos?: string[]; // Changed photos to be optional
  classId?: string;
  pokemonCollection?: { id: string; name: string; image: string }[];
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
  
  // Add a dummy function for onStudentsAdded
  const handleStudentsAdded = (studentIds: string[]) => {
    console.log("Students added:", studentIds);
    // This is just a placeholder since we're only viewing students in this context
  };

  return (
    <>
      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="pokemon">Pokémon</TabsTrigger>
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
                {student.pokemonCollection?.length || 0} Pokémon collected
              </p>
            </CardHeader>
            <CardContent>
              {student.pokemonCollection && student.pokemonCollection.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {student.pokemonCollection.map((pokemon) => (
                    <div 
                      key={pokemon.id} 
                      className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
                    >
                      <div className="p-2 bg-gray-50">
                        <img 
                          src={pokemon.image} 
                          alt={pokemon.name}
                          className="w-full h-24 object-contain"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-sm font-medium">{pokemon.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No Pokémon collected yet
                </p>
              )}
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
          onStudentsAdded={handleStudentsAdded} // Add the required prop
          viewMode={true} // Set to true for viewing mode
        />
      )}
    </>
  );
};
