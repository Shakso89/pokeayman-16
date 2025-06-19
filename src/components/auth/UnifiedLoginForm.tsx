
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, GraduationCap } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { toast } from '@/hooks/use-toast';

const UnifiedLoginForm: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUnifiedAuth();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify student exists and is active
      const { data: student, error } = await supabase
        .from('students')
        .select('id, username, is_active, is_frozen')
        .eq('id', studentId)
        .single();

      if (error || !student) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Student ID not found'
        });
        return;
      }

      if (!student.is_active || student.is_frozen) {
        toast({
          variant: 'destructive',
          title: 'Account Inactive',
          description: 'Your account has been deactivated. Please contact your teacher.'
        });
        return;
      }

      // Update last login
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', studentId);

      const success = await login(studentId, 'student');
      if (success) {
        localStorage.setItem('studentUsername', student.username);
        toast({
          title: 'Welcome!',
          description: `Logged in as ${student.username}`
        });
      }
    } catch (error) {
      console.error('Student login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'An error occurred during login'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify teacher credentials
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('id, username, password, is_active, is_frozen, role')
        .eq('username', teacherUsername)
        .single();

      if (error || !teacher) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid username or password'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(teacherPassword, teacher.password);
      if (!isPasswordValid) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid username or password'
        });
        return;
      }

      if (!teacher.is_active || teacher.is_frozen) {
        toast({
          variant: 'destructive',
          title: 'Account Inactive',
          description: 'Your account has been deactivated. Please contact support.'
        });
        return;
      }

      // Update last login
      await supabase
        .from('teachers')
        .update({ last_login: new Date().toISOString() })
        .eq('id', teacher.id);

      const success = await login(teacher.id, teacher.role);
      if (success) {
        localStorage.setItem('teacherUsername', teacher.username);
        localStorage.setItem('userEmail', teacherUsername); // For compatibility
        toast({
          title: 'Welcome!',
          description: `Logged in as ${teacher.username}`
        });
      }
    } catch (error) {
      console.error('Teacher login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'An error occurred during login'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-gray-600">Choose your login type</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Teacher
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Enter your Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login as Student'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="teacher" className="space-y-4">
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacherUsername">Username</Label>
                  <Input
                    id="teacherUsername"
                    type="text"
                    placeholder="Enter your username"
                    value={teacherUsername}
                    onChange={(e) => setTeacherUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacherPassword">Password</Label>
                  <Input
                    id="teacherPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login as Teacher'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLoginForm;
