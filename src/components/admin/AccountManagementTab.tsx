
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserX, UserCheck, Trash2, Freeze, Snowflake } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppRole, getRoleDisplayName, getRoleBadgeColor } from '@/types/roles';

interface Teacher {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  is_active: boolean;
  role?: AppRole;
  last_login?: string;
}

interface AccountManagementTabProps {
  teachers: Teacher[];
  onRefresh: () => void;
}

const AccountManagementTab: React.FC<AccountManagementTabProps> = ({ teachers, onRefresh }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccountAction = async (teacherId: string, action: 'freeze' | 'unfreeze' | 'delete', displayName: string) => {
    setIsProcessing(true);
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('teachers')
          .delete()
          .eq('id', teacherId);
        
        if (error) throw error;
        
        toast({
          title: "Account Deleted",
          description: `${displayName}'s account has been permanently deleted`
        });
      } else {
        const { error } = await supabase
          .from('teachers')
          .update({ is_active: action === 'unfreeze' })
          .eq('id', teacherId);
        
        if (error) throw error;
        
        toast({
          title: action === 'freeze' ? "Account Frozen" : "Account Unfrozen",
          description: `${displayName}'s account has been ${action === 'freeze' ? 'frozen' : 'unfrozen'}`
        });
      }
      
      onRefresh();
    } catch (error: any) {
      console.error(`Error ${action}ing account:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} account`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Account Management</h3>
        <div className="text-sm text-gray-500">
          Total Accounts: {teachers.length} | Active: {teachers.filter(t => t.is_active).length} | Frozen: {teachers.filter(t => !t.is_active).length}
        </div>
      </div>

      <div className="grid gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className={!teacher.is_active ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {!teacher.is_active && <Snowflake className="h-5 w-5 text-red-500" />}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{teacher.display_name}</h4>
                      <Badge className={getRoleBadgeColor(teacher.role || 'teacher')}>
                        {getRoleDisplayName(teacher.role || 'teacher')}
                      </Badge>
                      {!teacher.is_active && (
                        <Badge variant="destructive">Frozen</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{teacher.username}</p>
                    {teacher.email && (
                      <p className="text-xs text-gray-400">{teacher.email}</p>
                    )}
                    {teacher.last_login && (
                      <p className="text-xs text-gray-400">
                        Last login: {new Date(teacher.last_login).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {teacher.is_active ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Freeze className="h-4 w-4 mr-1" />
                          Freeze
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Freeze Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to freeze {teacher.display_name}'s account? 
                            They will not be able to log in until unfrozen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleAccountAction(teacher.id, 'freeze', teacher.display_name)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            Freeze Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAccountAction(teacher.id, 'unfreeze', teacher.display_name)}
                      disabled={isProcessing}
                      className="text-green-600 hover:text-green-700"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Unfreeze
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete {teacher.display_name}'s account? 
                          This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleAccountAction(teacher.id, 'delete', teacher.display_name)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountManagementTab;
