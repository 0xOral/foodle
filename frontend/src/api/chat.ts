import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface User {
  id: string;
  username: string;
  profilePicture?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  participant: User;
  lastMessage: Message | null;
  unreadCount: number;
}

export const getChats = async (): Promise<Chat[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE_URL}/api/chats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.chats;
};

export const createChat = async (participantId: string): Promise<Chat> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE_URL}/api/chats`, 
    { participantId },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getMessages = async (chatId: string): Promise<Message[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.messages;
};

export const sendMessage = async (
  chatId: string,
  content: string
): Promise<Message> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE_URL}/api/chats/${chatId}/messages`, 
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
}; 