import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Post from "@/components/Post";
import PostForm from "@/components/PostForm";
import ProfileCard from "@/components/ProfileCard";
import { Post as PostType } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import CourseSidebar from "@/components/CourseSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CourseJoinDialog from "@/components/CourseJoinDialog";
import { getHomePosts } from "@/api/post";

const Index = () => {
  const [allPosts, setAllPosts] = useState<PostType[]>([]);
  const { isAuthenticated } = useAuth();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (isAuthenticated) {
        try {
          const posts = await getHomePosts();
          setAllPosts(posts["posts"]);
        } catch (error) {
          console.error("Failed to fetch posts:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthenticated]);

  const handlePostCreated = (newPost: PostType) => {
    setAllPosts(prev => [newPost, ...prev]);
  };
  
  const handlePostDeleted = (deletedPostId: string) => {
    setAllPosts(prev => prev.filter(post => post.id !== deletedPostId));
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-foodle-background text-foodle-text flex w-full">
        <CourseSidebar onJoinCourse={() => setIsJoinDialogOpen(true)} />
        
        <SidebarInset className="flex-1">
          <Navbar />
          
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Main Feed */}
              <div className="md:col-span-3 space-y-6">
                
                {isLoading ? (
                  <div className="food-card p-6 text-center">
                    <p className="text-foodle-text">Loading posts...</p>
                  </div>
                ) : allPosts.length > 0 ? (
                  allPosts.map(post => (
                    <Post 
                      key={post.id} 
                      post={post} 
                      onPostDeleted={() => handlePostDeleted(post.id)} 
                    />
                  ))
                ) : (
                  <div className="food-card p-6 text-center">
                    <p className="text-foodle-text">No posts yet. Be the first to create a post!</p>
                  </div>
                )}
              </div>
              
              {/* Right Sidebar - Profile */}
              <div className="hidden md:block">
                {isAuthenticated ? (
                  <ProfileCard />
                ) : (
                  <div className="food-card p-6">
                    <h2 className="text-lg font-semibold text-foodle-text mb-4">Join Foodle</h2>
                    <p className="text-gray-400 mb-4">
                      Sign in to post, comment, and interact with the community.
                    </p>
                  </div>
                )}
              </div>
            </div>
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

export default Index;
