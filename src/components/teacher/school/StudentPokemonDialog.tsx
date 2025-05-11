
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Student } from "@/types/pokemon";

interface StudentPokemonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  pokemon: any[];
}

const StudentPokemonDialog: React.FC<StudentPokemonDialogProps> = ({
  open,
  onOpenChange,
  student,
  pokemon,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {student?.displayName}'s pokemon
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {pokemon.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pokemon.map((pokemon, index) => (
                <div key={index} className="text-center">
                  <img 
                    src={pokemon.image || "/placeholder.svg"} 
                    alt={pokemon.name} 
                    className="w-20 h-20 mx-auto object-contain" 
                  />
                  <p className="text-sm font-medium mt-2">{pokemon.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6">no-pokemon-yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPokemonDialog;
