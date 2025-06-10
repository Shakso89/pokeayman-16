
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Coins, Plus, Minus, History, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

interface Teacher {
  id: string;
  username: string;
  display_name: string;
  credits?: number;
  unlimited_credits?: boolean;
}

interface CreditTransaction {
  id: string;
  teacher_id: string;
  amount: number;
  reason: string;
  timestamp: string;
  teacher_name?: string;
}

interface CreditManagementTabProps {
  teachers: Teacher[];
  onRefresh: () => void;
}

const CreditManagementTab: React.FC<CreditManagementTabProps> = ({ teachers, onRefresh }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { userRole, permissions, isOwner } = useUserRole();
  const { user } = useAuth();

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select(`
          *,
          teachers!credit_transactions_teacher_id_fkey(display_name)
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      const processedTransactions = (data || []).map(transaction => ({
        ...transaction,
        teacher_name: transaction.teachers?.display_name || 'Unknown'
      }));

      setTransactions(processedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadTransactions();
    }
  }, [showHistory]);

  const handleCreditManagement = async (action: 'add' | 'deduct') => {
    if (!selectedTeacher || creditAmount <= 0) return;

    setIsProcessing(true);
    try {
      const amount = action === 'add' ? creditAmount : -creditAmount;
      
      console.log("Attempting credit management:", {
        targetUserId: selectedTeacher.id,
        amount,
        reason: reason || `${action === 'add' ? 'Added' : 'Deducted'} ${creditAmount} credits`
      });
      
      const { error } = await supabase.rpc('manage_user_credits', {
        target_user_id: selectedTeacher.id,
        credit_amount: amount,
        reason: reason || `${action === 'add' ? 'Added' : 'Deducted'} ${creditAmount} credits`
      });

      if (error) {
        console.error("Credit management error:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: `${action === 'add' ? 'Added' : 'Deducted'} ${creditAmount} credits ${action === 'add' ? 'to' : 'from'} ${selectedTeacher.display_name}`
      });

      setIsDialogOpen(false);
      setCreditAmount(0);
      setReason('');
      onRefresh();
      if (showHistory) loadTransactions();
    } catch (error: any) {
      console.error('Error managing credits:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to manage credits",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  console.log("Credit management access check:", {
    userRole,
    isOwner,
    hasPermissions: permissions.canManageCredits
  });

  // Check if user can manage credits - using the improved isOwner from useUserRole
  if (!isOwner && userRole !== 'owner' && !permissions.canManageCredits) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Lock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Owner Access Required</h3>
          <p className="text-gray-500">Only owners can manage credits. Contact an owner for credit management.</p>
          <p className="text-xs text-gray-400 mt-2">
            Current role: {userRole} | Is Owner: {isOwner ? 'Yes' : 'No'} | Can manage credits: {permissions.canManageCredits ? 'Yes' : 'No'}
          </p>
        </div>
        
        {/* Show read-only credit overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="opacity-60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{teacher.display_name}</h4>
                    <p className="text-sm text-gray-500">{teacher.username}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-yellow-600">
                      <Coins className="h-4 w-4 mr-1" />
                      {teacher.unlimited_credits ? '∞' : (teacher.credits || 0)}
                    </div>
                    {teacher.unlimited_credits && (
                      <p className="text-xs text-gray-500">Unlimited</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Credit Management</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4 mr-2" />
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Coins className="h-4 w-4 mr-2" />
                Manage Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Credits</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Teacher</Label>
                  <Select onValueChange={(value) => {
                    const teacher = teachers.find(t => t.id === value);
                    setSelectedTeacher(teacher || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.display_name} ({teacher.credits || 0} credits)
                          {teacher.unlimited_credits && ' - Unlimited'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Credit Amount</Label>
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label>Reason</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for credit adjustment"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleCreditManagement('add')}
                    disabled={!selectedTeacher || creditAmount <= 0 || isProcessing}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credits
                  </Button>
                  <Button 
                    onClick={() => handleCreditManagement('deduct')}
                    disabled={!selectedTeacher || creditAmount <= 0 || isProcessing}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Deduct Credits
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Teachers Credit Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <Card key={teacher.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{teacher.display_name}</h4>
                  <p className="text-sm text-gray-500">{teacher.username}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-yellow-600">
                    <Coins className="h-4 w-4 mr-1" />
                    {teacher.unlimited_credits ? '∞' : (teacher.credits || 0)}
                  </div>
                  {teacher.unlimited_credits && (
                    <p className="text-xs text-gray-500">Unlimited</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.teacher_name}</p>
                    <p className="text-sm text-gray-500">{transaction.reason}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreditManagementTab;
