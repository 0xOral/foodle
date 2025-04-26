
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ChatBox from "@/components/ChatBox";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CourseSidebar from "@/components/CourseSidebar";
import CourseJoinDialog from "@/components/CourseJoinDialog";

const Chat = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const handleSignIn = () => {
    const authTrigger = document.querySelector("#auth-trigger") as HTMLButtonElement;
    if (authTrigger) {
      authTrigger.click();
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-foodle-background text-foodle-text flex w-full">
        <CourseSidebar onJoinCourse={() => setIsJoinDialogOpen(true)} />
        
        <SidebarInset className="flex-1">
          <Navbar />
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 w-full">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            
            {isAuthenticated ? (
              <ChatBox 
                selectedUserId={selectedUserId} 
                onSelectUser={setSelectedUserId} 
              />
            ) : (
              <div className="food-card flex flex-col items-center justify-center py-16">
                <h2 className="text-xl font-bold mb-4">Sign In to Access Chat</h2>
                <p className="text-gray-400 mb-6 text-center max-w-md">
                  Connect with other food enthusiasts and share your culinary tips in private messages.
                </p>
                <Button 
                  onClick={handleSignIn}
                  className="bg-foodle-accent hover:bg-foodle-accent-hover"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>

      <CourseJoinDialog 
        open={isJoinDialogOpen} 
        onOpenChange={setIsJoinDialogOpen}
      />
    </SidebarProvider>
  );
};

export default Chat;
