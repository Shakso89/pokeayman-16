
import React, { memo, useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
}

interface Contact {
  id: string;
  name: string;
  type: 'teacher' | 'student';
}

interface MessagesProps {
  userType?: "teacher" | "student";
  userName?: string;
}

const Messages: React.FC<MessagesProps> = ({ userType = "teacher", userName = "User" }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = userType === "teacher" 
    ? localStorage.getItem("teacherId") 
    : localStorage.getItem("studentId");

  // Load messages and contacts
  useEffect(() => {
    if (currentUserId) {
      loadMessages();
      loadContacts();
      
      // Setup realtime subscription for messages
      const channel = supabase
        .channel('messages-realtime')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages' 
          },
          (payload) => {
            console.log("Message change detected:", payload);
            loadMessages();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId]);

  const loadMessages = async () => {
    if (!currentUserId) return;
    
    try {
      console.log("Loading messages for user:", currentUserId);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error loading messages:", error);
        throw error;
      }
      
      console.log("Loaded messages:", data);
      
      // Add sender/recipient names
      const messagesWithNames = await Promise.all(
        (data || []).map(async (msg) => {
          const senderName = await getUserName(msg.sender_id);
          const recipientName = await getUserName(msg.recipient_id);
          return {
            ...msg,
            sender_name: senderName,
            recipient_name: recipientName
          };
        })
      );
      
      setMessages(messagesWithNames);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      console.log("Loading contacts...");
      // Load teachers
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, display_name');
        
      // Load students  
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, display_name');
        
      if (teachersError) console.error("Error loading teachers:", teachersError);
      if (studentsError) console.error("Error loading students:", studentsError);
      
      const allContacts: Contact[] = [
        ...(teachers || []).map(t => ({ 
          id: t.id, 
          name: t.display_name || 'Teacher', 
          type: 'teacher' as const 
        })),
        ...(students || []).map(s => ({ 
          id: s.id, 
          name: s.display_name || 'Student', 
          type: 'student' as const 
        }))
      ].filter(contact => contact.id !== currentUserId);
      
      console.log("Loaded contacts:", allContacts);
      setContacts(allContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const getUserName = async (userId: string): Promise<string> => {
    try {
      // Try teachers first
      const { data: teacher } = await supabase
        .from('teachers')
        .select('display_name')
        .eq('id', userId)
        .single();
        
      if (teacher) return teacher.display_name || 'Teacher';
      
      // Try students
      const { data: student } = await supabase
        .from('students')
        .select('display_name')
        .eq('id', userId)
        .single();
        
      return student?.display_name || 'User';
    } catch {
      return 'User';
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRecipient || !currentUserId) {
      toast({
        title: "Error",
        description: "Please select a recipient and enter a message",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Sending message:", {
        sender_id: currentUserId,
        recipient_id: selectedRecipient,
        subject: newSubject.trim() || 'No Subject',
        content: newMessage.trim()
      });

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: selectedRecipient,
          subject: newSubject.trim() || 'No Subject',
          content: newMessage.trim()
        });
        
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      
      setNewMessage("");
      setNewSubject("");
      setSelectedRecipient("");
      setIsNewMessageOpen(false);
      
      toast({
        title: "Success",
        description: "Message sent successfully"
      });
      
      // Reload messages to show the new one
      setTimeout(() => {
        loadMessages();
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
        
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const conversationMessages = selectedContact 
    ? messages.filter(msg => 
        (msg.sender_id === selectedContact && msg.recipient_id === currentUserId) ||
        (msg.sender_id === currentUserId && msg.recipient_id === selectedContact)
      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType={userType} userName={userName} />
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">To:</label>
                  <select 
                    value={selectedRecipient} 
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Select recipient...</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject:</label>
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Enter subject..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message:</label>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <Button onClick={sendMessage} disabled={!newMessage.trim() || !selectedRecipient}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Contacts List */}
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading contacts...</div>
                ) : filteredContacts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No contacts found</div>
                ) : (
                  filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedContact === contact.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedContact(contact.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {contact.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{contact.type}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  {selectedContact 
                    ? `Conversation with ${contacts.find(c => c.id === selectedContact)?.name || 'User'}`
                    : 'Select a contact to start messaging'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[450px] flex flex-col">
                {selectedContact ? (
                  <>
                    <ScrollArea className="flex-1 mb-4">
                      <div className="space-y-4">
                        {conversationMessages.length === 0 ? (
                          <div className="text-center text-gray-500 mt-8">
                            No messages yet. Start the conversation!
                          </div>
                        ) : (
                          conversationMessages.map(message => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                              }`}
                              onClick={() => !message.read && message.recipient_id === currentUserId && markAsRead(message.id)}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-lg ${
                                  message.sender_id === currentUserId
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                              >
                                {message.subject && message.subject !== 'No Subject' && (
                                  <p className="font-medium text-sm mb-1">{message.subject}</p>
                                )}
                                <p>{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {new Date(message.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (selectedContact && newMessage.trim()) {
                              setSelectedRecipient(selectedContact);
                              sendMessage();
                            }
                          }
                        }}
                      />
                      <Button 
                        onClick={() => {
                          if (selectedContact && newMessage.trim()) {
                            setSelectedRecipient(selectedContact);
                            sendMessage();
                          }
                        }} 
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a contact to start messaging
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default memo(Messages);
