
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Effect to perform search when term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    // Small timeout to prevent excessive searches while typing
    const timer = setTimeout(() => {
      performSearch(searchTerm);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const performSearch = (term: string) => {
    try {
      const searchTermLower = term.toLowerCase();

      // Search teachers
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacherResults = teachers.filter((teacher: any) => 
        teacher.displayName?.toLowerCase().includes(searchTermLower) || 
        teacher.username.toLowerCase().includes(searchTermLower)
      ).map((teacher: any) => ({
        id: teacher.id,
        name: teacher.displayName || teacher.username,
        username: teacher.username,
        type: "teacher" as const,
        avatar: teacher.avatar
      }));

      // Search students
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const studentResults = students.filter((student: any) => 
        student.displayName?.toLowerCase().includes(searchTermLower) || 
        student.username?.toLowerCase().includes(searchTermLower) || 
        student.name?.toLowerCase().includes(searchTermLower)
      ).map((student: any) => ({
        id: student.id,
        name: student.displayName || student.name,
        username: student.username,
        type: "student" as const,
        avatar: student.avatar
      }));

      setSearchResults([...teacherResults, ...studentResults]);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    }
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
      <div className="relative flex items-center w-full" onClick={() => setIsOpen(true)}>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          className="w-full pl-8 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t("search-teachers-students")}
          readOnly
        />
      </div>
      
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder={t("search-teachers-students")} value={searchTerm} onValueChange={setSearchTerm} />
        <CommandList>
          {isLoading && <div className="py-6 text-center text-sm">{t("searching")}...</div>}
          <CommandEmpty>{t("no-results-found")}</CommandEmpty>
          {searchResults.length > 0 && (
            <>
              <CommandGroup heading={t("teachers")}>
                {searchResults.filter(user => user.type === "teacher").map(user => (
                  <CommandItem key={`teacher-${user.id}`} onSelect={() => handleSelectUser(user)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          {user.username && <p className="text-xs text-gray-500">@{user.username}</p>}
                        </div>
                      </div>
                    </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading={t("students")}>
                {searchResults.filter(user => user.type === "student").map(user => (
                  <CommandItem key={`student-${user.id}`} onSelect={() => handleSelectUser(user)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          {user.username && <p className="text-xs text-gray-500">@{user.username}</p>}
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
