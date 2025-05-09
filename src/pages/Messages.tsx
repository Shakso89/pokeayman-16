
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Camera, Mic, UserPlus } from "lucide-react";
import { Message, FriendRequest } from "@/types/pokemon";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import AddFriendDialog from "@/components/messaging/AddFriendDialog";

const MessagesPage: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const userName = userType === "teacher" ? 
    localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") : 
    localStorage.getItem("studentName");
  const userId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
    
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaType, setMediaType] = useState<"text" | "photo" | "voice">("text");
  const [mediaContent, setMediaContent] = useState<string | null>(null);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    
    loadContacts();
  }, [isLoggedIn, userId, userType, navigate]);
  
  useEffect(() => {
    if (selectedContact) {
      loadMessages();
    }
  }, [selectedContact]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const loadContacts = () => {
    if (!userId) return;
    
    // Load friends
    const friendRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const acceptedRequests = friendRequests.filter(request => 
      request.status === "accepted" && 
      (request.senderId === userId || request.receiverId === userId)
    );
    
    // Get the other person's ID for each friendship
    const friendIds = acceptedRequests.map(request => 
      request.senderId === userId ? request.receiverId : request.senderId
    );
    
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    
    // Get friend details
    const contactDetails = friendIds.map(friendId => {
      const teacher = teachers.find((t: any) => t.id === friendId);
      if (teacher) {
        return {
          id: teacher.id,
          name: teacher.displayName || teacher.username,
          avatar: teacher.avatar,
          type: "teacher"
        };
      }
      
      const student = students.find((s: any) => s.id === friendId);
      if (student) {
        return {
          id: student.id,
          name: student.displayName || student.name,
          avatar: student.avatar,
          type: "student"
        };
      }
      
      return null;
    }).filter(contact => contact !== null);
    
    setContacts(contactDetails);
  };
  
  const loadMessages = () => {
    if (!userId || !selectedContact) return;
    
    const allMessages: Message[] = JSON.parse(localStorage.getItem("messages") || "[]");
    const relevantMessages = allMessages.filter(message => 
      (message.senderId === userId && message.receiverId === selectedContact.id) ||
      (message.receiverId === userId && message.senderId === selectedContact.id)
    );
    
    // Sort by date
    relevantMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Mark messages as read
    const updatedMessages = relevantMessages.map(message => {
      if (message.receiverId === userId && !message.read) {
        return {...message, read: true};
      }
      return message;
    });
    
    // Update localStorage with read status
    if (updatedMessages.some(message => message.receiverId === userId && !message.read)) {
      localStorage.setItem("messages", JSON.stringify(
        allMessages.map(message => {
          if (message.receiverId === userId && message.senderId === selectedContact.id) {
            return {...message, read: true};
          }
          return message;
        })
      ));
    }
    
    setMessages(updatedMessages);
  };
  
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = () => {
    if (!userId || !selectedContact || (!newMessage.trim() && mediaType === "text")) {
      return;
    }
    
    const newMessageObj: Message = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderType: userType as "teacher" | "student",
      senderName: userName || "",
      receiverId: selectedContact.id,
      receiverType: selectedContact.type,
      content: mediaType === "text" ? newMessage : "",
      createdAt: new Date().toISOString(),
      read: false
    };
    
    // Add attachment if needed
    if (mediaType !== "text" && mediaContent) {
      newMessageObj.attachment = {
        type: mediaType,
        content: mediaContent
      };
    }
    
    // Add to localStorage
    const allMessages: Message[] = JSON.parse(localStorage.getItem("messages") || "[]");
    allMessages.push(newMessageObj);
    localStorage.setItem("messages", JSON.stringify(allMessages));
    
    // Update state
    setMessages([...messages, newMessageObj]);
    setNewMessage("");
    setMediaType("text");
    setMediaContent(null);
  };
  
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaContent(reader.result as string);
        setMediaType("photo");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaContent(reader.result as string);
          setMediaType("voice");
        };
        reader.readAsDataURL(audioBlob);
        setIsRecording(false);
      });
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 30000);
      
      return mediaRecorder;
    } catch (error) {
      console.error("Error accessing microphone", error);
      toast({
        title: t("error"),
        description: t("microphone-access-error"),
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording logic would be here
      setIsRecording(false);
      return;
    }
    
    const recorder = await startRecording();
    if (!recorder) return;
    
    // Stop recording when clicked again
    setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }, 5000); // For demo purposes, auto-stop after 5 seconds
  };
  
  const cancelMediaUpload = () => {
    setMediaType("text");
    setMediaContent(null);
  };
  
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType={userType as "teacher" | "student"} userName={userName || ""} />
      
      <div className="container mx-auto py-8 px-4">
        <Card className="h-[calc(100vh-180px)] overflow-hidden">
          <div className="grid grid-cols-12 h-full">
            {/* Contact List */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-bold">{t("messages")}</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsAddFriendOpen(true)}
                  className="text-blue-500"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {t("add-friend")}
                </Button>
              </div>
              
              <div className="h-[calc(100vh-250px)] overflow-y-auto">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div 
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer ${
                        selectedContact?.id === contact.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <Avatar>
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>
                          {contact.name?.substring(0, 2).toUpperCase() || "NA"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>{t("no-contacts")}</p>
                    <p className="text-sm mt-2">{t("add-friends-to-message")}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col h-full">
              {selectedContact ? (
                <>
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedContact.avatar} />
                        <AvatarFallback>
                          {selectedContact.name?.substring(0, 2).toUpperCase() || "NA"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedContact.name}</p>
                        <p className="text-xs text-gray-500">{selectedContact.type}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((message) => {
                      const isMe = message.senderId === userId;
                      return (
                        <div 
                          key={message.id}
                          className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isMe ? "bg-blue-500 text-white" : "bg-gray-200"
                            }`}
                          >
                            {message.content && <p className="mb-1">{message.content}</p>}
                            
                            {message.attachment?.type === "photo" && (
                              <img 
                                src={message.attachment.content}
                                alt="Photo"
                                className="rounded max-w-full"
                              />
                            )}
                            
                            {message.attachment?.type === "voice" && (
                              <audio 
                                controls 
                                src={message.attachment.content}
                                className="w-full"
                              />
                            )}
                            
                            <p className="text-xs opacity-70 text-right mt-1">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>
                  
                  {mediaContent && (
                    <div className="p-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          {mediaType === "photo" ? (
                            <img 
                              src={mediaContent} 
                              alt="Upload preview" 
                              className="h-24 object-contain"
                            />
                          ) : (
                            <audio 
                              controls 
                              src={mediaContent}
                              className="w-full"
                            />
                          )}
                        </div>
                        <Button variant="destructive" size="sm" onClick={cancelMediaUpload}>
                          {t("cancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("type-message")}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={mediaType !== "text"}
                      />
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handlePhotoClick}
                        disabled={mediaType !== "text"}
                      >
                        <Camera className="h-5 w-5" />
                        <input 
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleMicClick}
                        className={isRecording ? "bg-red-100 text-red-500" : ""}
                        disabled={mediaType !== "text" && !isRecording}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                      
                      <Button onClick={handleSendMessage}>
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">{t("select-contact")}</p>
                    <p className="text-sm mt-2">{t("select-contact-description")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      <AddFriendDialog 
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
        onFriendAdded={loadContacts}
      />
    </div>
  );
};

export default MessagesPage;
