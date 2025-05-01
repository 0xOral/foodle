import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { login as apiLogin, register as apiRegister, fetchUserFromToken } from "@/api/auth"; // Import real API methods


interface User {
  username: string;
  id: string;
  profilePicture?: string;
  enrolledCourses: string[];
  karma: number;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Use the token to fetch user details (replace with actual API call)
      fetchUserFromToken(token)
        .then((user) => {
          setCurrentUser(user);
        })
        .catch((error) => {
          console.error("Failed to fetch user with token", error);
          toast({
            title: "Authentication failed",
            description: "Unable to verify user.",
            variant: "destructive",
          });
        });
    }
  }, []); // Empty dependency array means this runs only once on mount


  // Login using the real API
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const isLoggedIn = await apiLogin(username, password);
      if (isLoggedIn) {
        // Create a user object with the username
        const user: User = isLoggedIn;
        setCurrentUser(user);
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${user.username}!`,
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred while logging in.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Logout functionality
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('access_token');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  // Register using the real API
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const isRegistered = await apiRegister(username, password);
      if (isRegistered) {
        const newUser: User = { 
          username, 
          id: "123", // This should come from the API response
          profilePicture: "/placeholder.svg" ,
          enrolledCourses: [],
          karma: 0,
        };
        setCurrentUser(newUser);
        toast({
          title: "Registration successful",
          description: `Welcome to Foodle, ${username}!`,
        });
        return true;
      } else {
        toast({
          title: "Registration failed",
          description: "Username already exists or error occurred.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Registration error",
        description: "An error occurred while registering.",
        variant: "destructive",
      });
      return false;
    }
  };

  const value = {
    currentUser,
    isAuthenticated: currentUser !== null,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
