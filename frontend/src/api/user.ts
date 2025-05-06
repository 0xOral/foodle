import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export interface User {
  id: string;
  username: string;
  profilePicture?: string;
  karma: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  instructor: string;
  enrolledStudents: string[];
}

export const getUserById = async (userId: string): Promise<User> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getUserPosts = async (userId: string): Promise<any[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.posts;
};

export const getUserCourses = async (userId: string): Promise<Course[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.courses;
};

export const getUserProfile = async (userId: string): Promise<User> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}; 