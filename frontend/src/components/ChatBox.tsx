
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { users } from "@/data/mockData";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

const ChatBox = ({ selectedUserId, onSelectUser }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "2",
      receiverId: "1",
      content: "Hey, did you try that new pasta recipe?",
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: "2",
      senderId: "1",
      receiverId: "2",
      content: "Not yet! Is it good?",
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      id: "3",
      senderId: "2",
      receiverId: "1",
      content: "It's amazing! I'll send you the link.",
      timestamp: new Date(Date.now() - 3400000)
    },
    {
      id: "4",
      senderId: "3",
      receiverId: "1",
      content: "Have you visited that new restaurant downtown?",
      timestamp: new Date(Date.now() - 1800000)
    }
  ]);
  
  const [messageInput, setMessageInput] = useState("");
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const otherUsers = users.filter(user => user.id !== currentUser?.id);
  const selectedUser = users.find(user => user.id === selectedUserId);
  
  const filteredMessages = messages.filter(
    msg => 
      (msg.senderId === currentUser?.id && msg.receiverId === selectedUserId) || 
      (msg.receiverId === currentUser?.id && msg.senderId === selectedUserId)
  );
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !currentUser || !selectedUserId) {
      toast({
        title: "Cannot send message",
        description: "Please sign in and select a user to chat with",
        variant: "destructive",
      });
      return;
    }
    
    if (!messageInput.trim()) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedUserId,
      content: messageInput.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
  };
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  if (!isAuthenticated) {
    return (
      <div className="food-card h-96 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foodle-text mb-2">Sign In to Chat</h3>
          <p className="text-gray-500">Join Foodle to chat with other food enthusiasts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="food-card h-[600px] flex">
      {/* User list */}
      <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
        <h3 className="text-lg font-bold p-4 border-b border-gray-800">Chats</h3>
        <div className="divide-y divide-gray-800">
          {otherUsers.map(user => (
            <button
              key={user.id}
              className={`flex items-center gap-3 p-4 w-full text-left hover:bg-gray-800 transition-colors ${
                selectedUserId === user.id ? 'bg-gray-800' : ''
              }`}
              onClick={() => onSelectUser(user.id)}
            >
              <img 
                src={user.profilePicture || "/placeholder.svg"} 
                alt={user.username} 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-foodle-text">{user.username}</p>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="w-2/3 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
              <img 
                src={selectedUser.profilePicture || "/placeholder.svg"} 
                alt={selectedUser.username} 
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-foodle-text">{selectedUser.username}</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {filteredMessages.length > 0 ? (
                filteredMessages.map(message => {
                  const isMine = message.senderId === currentUser?.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex mb-4 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isMine 
                            ? 'bg-foodle-accent text-white rounded-br-none' 
                            : 'bg-gray-800 text-foodle-text rounded-bl-none'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-pink-100' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No messages yet. Say hello!</p>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex gap-2">
              <Input
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border-gray-700 text-foodle-text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <Button 
                type="submit" 
                className="bg-foodle-accent hover:bg-foodle-accent-hover"
                disabled={!messageInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-bold text-foodle-text mb-2">Select a Chat</h3>
              <p className="text-gray-500">Choose a user from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
