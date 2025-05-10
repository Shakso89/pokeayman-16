import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pokemon } from "@/types/pokemon";

interface ClassManagementProps {
  onBack: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const teacherId = localStorage.getItem("teacherId") || "";
  const [classes, setClasses] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editedClassName, setEditedClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [classPokemonPool, setClassPokemonPool] = useState<Pokemon[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [isAwardCoinsOpen, setIsAwardCoinsOpen] = useState(false);
  const [isRemovePokemonOpen, setIsRemovePokemonOpen] = useState(false);
  const [isRemoveCoinsOpen, setIsRemoveCoinsOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any | null>(null);

  useEffect(() => {
    loadClasses();
    loadAvailableStudents();
  }, [teacherId]);

  useEffect(() => {
    if (selectedClassId) {
      loadStudentsInClass();
    } else {
      setStudentsInClass([]);
    }
  }, [selectedClassId]);

  const loadClasses = () => {
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const teacherClasses = parsedClasses.filter(
      (c: any) => c.teacherId === teacherId
    );
    setClasses(teacherClasses);
  };

  const loadAvailableStudents = () => {
    const savedStudents = localStorage.getItem("students");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
    const teacherStudents = parsedStudents.filter(
      (s: any) => s.teacherId === teacherId
    );
    setAvailableStudents(teacherStudents);
  };

  const loadStudentsInClass = () => {
    if (!selectedClassId) return;

    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const selectedClass = parsedClasses.find((c: any) => c.id === selectedClassId);

    if (selectedClass && selectedClass.students) {
      const savedStudents = localStorage.getItem("students");
      const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
      const classStudents = parsedStudents.filter((student: any) =>
        selectedClass.students.includes(student.id)
      );
      setStudentsInClass(classStudents);
    } else {
      setStudentsInClass([]);
    }
  };

  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: t("error"),
        description: "Class name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const classId = "class-" + Date.now().toString();
    const newClass = {
      id: classId,
      name: newClassName,
      teacherId: teacherId,
      createdAt: new Date().toISOString(),
      students: [],
    };

    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    parsedClasses.push(newClass);
    localStorage.setItem("classes", JSON.stringify(parsedClasses));

    loadClasses();
    setNewClassName("");
    toast({
      title: t("success"),
      description: t("new-class-created"),
    });
  };

  const handleEditClass = (classId: string, className: string) => {
    setEditingClassId(classId);
    setEditedClassName(className);
  };

  const handleUpdateClass = () => {
    if (!editingClassId) return;

    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedClasses = parsedClasses.map((c: any) =>
      c.id === editingClassId ? { ...c, name: editedClassName } : c
    );
    localStorage.setItem("classes", JSON.stringify(updatedClasses));

    loadClasses();
    setEditingClassId(null);
    setEditedClassName("");
    toast({
      title: t("success"),
      description: t("class-updated"),
    });
  };

  const handleDeleteClass = () => {
    if (!classToDelete) return;

    const savedClasses = localStorage.getItem("classes");
    let parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    parsedClasses = parsedClasses.filter((c: any) => c.id !== classToDelete.id);
    localStorage.setItem("classes", JSON.stringify(parsedClasses));

    loadClasses();
    setClassToDelete(null);
    toast({
      title: t("success"),
      description: t("class-deleted"),
    });
  };

  const handleAddStudentToClass = (studentId: string) => {
    if (!selectedClassId) return;

    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedClasses = parsedClasses.map((c: any) => {
      if (c.id === selectedClassId) {
        if (!c.students) {
          c.students = [];
        }
        if (!c.students.includes(studentId)) {
          c.students.push(studentId);
        }
      }
      return c;
    });
    localStorage.setItem("classes", JSON.stringify(updatedClasses));

    loadStudentsInClass();
    loadClasses();
  };

  const handleRemoveStudentFromClass = (studentId: string) => {
    if (!selectedClassId) return;

    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedClasses = parsedClasses.map((c: any) => {
      if (c.id === selectedClassId) {
        c.students = c.students.filter((id: string) => id !== studentId);
      }
      return c;
    });
    localStorage.setItem("classes", JSON.stringify(updatedClasses));

    loadStudentsInClass();
    loadClasses();
    toast({
      title: t("success"),
      description: t("student-removed"),
    });
  };

  const handleAwardCoins = () => {
    if (!selectedStudentId) return;

    const amount = parseInt(coinAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t("error"),
        description: "Invalid coin amount",
        variant: "destructive",
      });
      return;
    }

    const savedStudents = localStorage.getItem("students");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
    const updatedStudents = parsedStudents.map((s: any) => {
      if (s.id === selectedStudentId) {
        s.coins = (s.coins || 0) + amount;
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    loadStudentsInClass();
    setIsAwardCoinsOpen(false);
    setCoinAmount("");
    toast({
      title: t("success"),
      description: t("coins-awarded"),
    });
  };

  const handleRemovePokemon = () => {
    if (!selectedStudentId) return;

    const savedStudents = localStorage.getItem("students");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
    const updatedStudents = parsedStudents.map((s: any) => {
      if (s.id === selectedStudentId) {
        if (s.pokemon && s.pokemon.length > 0) {
          s.pokemon.pop();
        } else {
          toast({
            title: t("error"),
            description: t("no-pokemon-to-remove"),
            variant: "destructive",
          });
          return s;
        }
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    loadStudentsInClass();
    setIsRemovePokemonOpen(false);
    toast({
      title: t("success"),
      description: t("pokemon-removed"),
    });
  };

  const handleRemoveCoins = () => {
    if (!selectedStudentId) return;

    const amount = parseInt(coinAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t("error"),
        description: "Invalid coin amount",
        variant: "destructive",
      });
      return;
    }

    const savedStudents = localStorage.getItem("students");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
    const updatedStudents = parsedStudents.map((s: any) => {
      if (s.id === selectedStudentId) {
        if ((s.coins || 0) >= amount) {
          s.coins = (s.coins || 0) - amount;
        } else {
          toast({
            title: t("error"),
            description: t("insufficient-student-coins"),
            variant: "destructive",
          });
          return s;
        }
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    loadStudentsInClass();
    setIsRemoveCoinsOpen(false);
    setCoinAmount("");
    toast({
      title: t("success"),
      description: t("coins-removed"),
    });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onBack} className="mr-4">
          {t("back")}
        </Button>
        <h2 className="text-2xl font-bold">{t("manage-classes")}</h2>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("create-class")}</CardTitle>
          <CardDescription>
            {t("create-and-manage-your-classes")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder={t("class-name")}
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <Button onClick={handleCreateClass}>{t("create-new-class")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("classes")}</CardTitle>
          <CardDescription>{t("manage-existing-classes")}</CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p>No classes created yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("class-name")}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {editingClassId === c.id ? (
                        <Input
                          type="text"
                          value={editedClassName}
                          onChange={(e) => setEditedClassName(e.target.value)}
                        />
                      ) : (
                        c.name
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingClassId === c.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleUpdateClass}
                            className="mr-2"
                          >
                            {t("save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingClassId(null)}
                          >
                            {t("cancel")}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleEditClass(c.id, c.name)}
                            className="mr-2"
                          >
                            {t("edit")}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                {t("delete")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("confirm-delete-class")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("are-you-sure-you-want-to-delete-this-class")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => setClassToDelete(c)}
                                >
                                  {t("delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("students")}</CardTitle>
          <CardDescription>{t("manage-students-in-classes")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="classSelect">Select Class</Label>
            <Select
              onValueChange={(value) => setSelectedClassId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClassId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("view-students")}
                </h3>
                {studentsInClass.length === 0 ? (
                  <p>{t("no-students-in-class")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsInClass.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.displayName}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleRemoveStudentFromClass(student.id)
                              }
                            >
                              {t("remove-student")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("add-student")}
                </h3>
                <Select
                  onValueChange={(value) => handleAddStudentToClass(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClassId && studentsInClass.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("manage-student-data")}</CardTitle>
            <CardDescription>
              {t("award-coins-or-remove-pokemon")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="studentSelect">Select Student</Label>
              <Select
                onValueChange={(value) => setSelectedStudentId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {studentsInClass.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudentId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Button onClick={() => setIsAwardCoinsOpen(true)}>
                    {t("award-coins")}
                  </Button>
                </div>
                <div>
                  <Button onClick={() => setIsRemovePokemonOpen(true)}>
                    {t("remove-pokemon")}
                  </Button>
                </div>
                <div>
                  <Button onClick={() => setIsRemoveCoinsOpen(true)}>
                    {t("remove-coins")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={classToDelete !== null} onOpenChange={(open) => {
        if (!open) setClassToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm-delete-class")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("are-you-sure-you-want-to-delete-this-class")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassToDelete(null)}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAwardCoinsOpen} onOpenChange={setIsAwardCoinsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("award-student-coins")}</DialogTitle>
            <DialogDescription>
              {t("award-coins-desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coinAmount" className="text-right">
                {t("coin-amount")}
              </Label>
              <Input
                type="number"
                id="coinAmount"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAwardCoinsOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" onClick={handleAwardCoins}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemovePokemonOpen} onOpenChange={setIsRemovePokemonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("remove-pokemon")}</DialogTitle>
            <DialogDescription>
              {t("remove-pokemon-desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsRemovePokemonOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" onClick={handleRemovePokemon}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveCoinsOpen} onOpenChange={setIsRemoveCoinsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("remove-coins")}</DialogTitle>
            <DialogDescription>
              {t("remove-coins-desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coinAmount" className="text-right">
                {t("coin-amount")}
              </Label>
              <Input
                type="number"
                id="coinAmount"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsRemoveCoinsOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" onClick={handleRemoveCoins}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassManagement;
