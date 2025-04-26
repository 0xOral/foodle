import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000";

// Token management
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface User {
  username: string;
  id: string;
  profilePicture?: string;
}


export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      return data;
    }
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

export const register = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Registration error:", error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('access_token');
  return;
};

export const fetchUserFromToken = async (token: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json", 
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data. Token may be invalid or expired.");
    }

    const user: User = await response.json();
    console.log("user", user);
    return user; // Return the user data from the response
  } catch (error) {
    console.error("Error fetching user with token:", error);
    throw new Error("Unable to fetch user. Token might be invalid or expired.");
  }
};