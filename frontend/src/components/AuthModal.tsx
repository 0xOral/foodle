import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (activeTab === "login") {
        success = await login(username, password);
      } else {
        success = await register(username, password);
      }
      
      if (success) {
        onClose();
        setUsername("");
        setPassword("");
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-foodle-card border-gray-800 text-foodle-text sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foodle-text">
            {activeTab === "login" ? "Welcome Back" : "Join Foodle"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-gray-800">
            <TabsTrigger value="login" className="data-[state=active]:bg-foodle-accent data-[state=active]:text-white">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-foodle-accent data-[state=active]:text-white">
              Register
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-foodle-text">Username</Label>
                <Input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-gray-800 border-gray-700 text-foodle-text"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-foodle-text">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-gray-800 border-gray-700 text-foodle-text"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-foodle-accent hover:bg-foodle-accent-hover"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-foodle-text">Username</Label>
                <Input
                  id="register-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="bg-gray-800 border-gray-700 text-foodle-text"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-foodle-text">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password"
                  className="bg-gray-800 border-gray-700 text-foodle-text"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-foodle-accent hover:bg-foodle-accent-hover"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            {activeTab === "login" 
              ? "Don't have an account? Click Register above." 
              : "Already have an account? Click Sign In above."}
          </p>
          <p className="mt-2">
            For demo, use any username with password: "password"
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
