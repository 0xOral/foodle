import { useEffect, useState } from "react";
import { Chat } from "@/api/chat";
import { getChats } from "@/api/chat";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

const ChatList = ({ onSelectChat, selectedChatId }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const fetchedChats = await getChats();
        setChats(fetchedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <MessageSquare className="w-12 h-12 mx-auto mb-2" />
        <p>No chats yet</p>
        <p className="text-sm">Start a conversation with someone!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {chats.map((chat) => (
        <Button
          key={chat.id}
          variant={selectedChatId === chat.id ? "secondary" : "ghost"}
          className={`w-full justify-start gap-3 ${
            selectedChatId === chat.id ? "bg-gray-800" : ""
          }`}
          onClick={() => onSelectChat(chat.id)}
        >
          <img
            src={chat.participant.profilePicture || "/placeholder.svg"}
            alt={chat.participant.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">{chat.participant.username}</span>
              {chat.unreadCount > 0 && (
                <span className="bg-foodle-accent text-white text-xs px-2 py-1 rounded-full">
                  {chat.unreadCount}
                </span>
              )}
            </div>
            {chat.lastMessage && (
              <p className="text-sm text-gray-400 truncate">
                {chat.lastMessage.content}
              </p>
            )}
            {chat.lastMessage && (
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(chat.lastMessage.timestamp), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default ChatList; 