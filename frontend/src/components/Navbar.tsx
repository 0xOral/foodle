import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import { Home, MessageSquare, User, LogOut, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="sticky top-0 z-10 bg-foodle-background border-b border-gray-800 py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="text-foodle-accent text-2xl font-bold mr-8 hover-scale">
            Foodle
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="flex items-center text-foodle-text hover:text-foodle-accent transition-colors">
              <Home className="mr-2 h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/chat" className="flex items-center text-foodle-text hover:text-foodle-accent transition-colors">
              <MessageSquare className="mr-2 h-5 w-5" />
              <span>Chat</span>
            </Link>
            {isAuthenticated && (
              <Link to="/profile" className="flex items-center text-foodle-text hover:text-foodle-accent transition-colors">
                <User className="mr-2 h-5 w-5" />
                <span>Profile</span>
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center mr-4">
                <img 
                  src={currentUser?.profilePicture || "/placeholder.svg"} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full mr-2"
                />
                <span className="text-foodle-text">{currentUser?.username}</span>
              </div>
              <Button 
                onClick={logout}
                variant="outline" 
                className="flex items-center text-foodle-text border-gray-700 hover:bg-foodle-card-hover"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsAuthModalOpen(true)} 
              variant="default"
              className="bg-foodle-accent hover:bg-foodle-accent-hover text-white"
              id="auth-trigger"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
