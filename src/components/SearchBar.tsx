
import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";

interface User {
  id: string;
  name: string;
  type: "teacher" | "student";
  avatar?: string;
  username?: string;
}

const SearchBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    const searchTerm = term.toLowerCase();
    
    // Search teachers
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const teacherResults = teachers
      .filter((teacher: any) => 
        teacher.displayName?.toLowerCase().includes(searchTerm) || 
        teacher.username.toLowerCase().includes(searchTerm)
      )
      .map((teacher: any) => ({
        id: teacher.id,
        name: teacher.displayName || teacher.username,
        username: teacher.username,
        type: "teacher" as const,
        avatar: teacher.avatar
      }));
    
    // Search students
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const studentResults = students
      .filter((student: any) => 
        student.displayName?.toLowerCase().includes(searchTerm) || 
        student.username?.toLowerCase().includes(searchTerm) ||
        student.name?.toLowerCase().includes(searchTerm)
      )
      .map((student: any) => ({
        id: student.id,
        name: student.displayName || student.name,
        username: student.username,
        type: "student" as const,
        avatar: student.avatar
      }));
    
    setSearchResults([...teacherResults, ...studentResults]);
  };
  
  const handleSelectUser = (user: User) => {
    setIsOpen(false);
    
    // Navigate to user profile based on type
    if (user.type === "teacher") {
      navigate(`/teacher/profile/${user.id}`);
    } else {
      navigate(`/teacher/student/${user.id}`);
    }
  };
  
  return (
    <>
      <div 
        className="relative flex items-center w-full" 
        onClick={() => setIsOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder={t("search-users")}
          className="pl-10 w-full"
          readOnly
        />
      </div>
      
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput 
          placeholder={t("search-teachers-students")} 
          onValueChange={handleSearch} 
        />
        <CommandList>
          <CommandEmpty>{t("no-results-found")}</CommandEmpty>
          {searchResults.length > 0 && (
            <>
              <CommandGroup heading={t("teachers")}>
                {searchResults
                  .filter(user => user.type === "teacher")
                  .map(user => (
                    <CommandItem 
                      key={`teacher-${user.id}`} 
                      onSelect={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          {user.username && (
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading={t("students")}>
                {searchResults
                  .filter(user => user.type === "student")
                  .map(user => (
                    <CommandItem 
                      key={`student-${user.id}`} 
                      onSelect={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          {user.username && (
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchBar;
