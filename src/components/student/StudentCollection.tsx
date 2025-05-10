import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
interface StudentCollectionProps {
  pokemons: Pokemon[];
}
const StudentCollection: React.FC<StudentCollectionProps> = ({
  pokemons
}) => {
  const {
    t
  } = useTranslation();
  return;
};
export default StudentCollection;