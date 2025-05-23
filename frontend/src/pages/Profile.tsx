import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Post from "@/components/Post";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Image, BookOpen, MessageSquare } from "lucide-react";
import CourseSidebar from "@/components/CourseSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CourseJoinDialog from "@/components/CourseJoinDialog";
import { getUserById, getCurrentUser, getUserPosts, getUserCourses, User } from "@/api/user";
import { createChat } from "@/api/chat";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  
  const isOwnProfile = currentUser?.id === profileUser?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        const userData = userId ? await getUserById(userId) : await getCurrentUser();
        setProfileUser(userData);

        // Fetch user posts
        const posts = await getUserPosts(userData.id);
        setUserPosts(posts);

        // Fetch user courses
        const courses = await getUserCourses(userData.id);
        setUserCourses(courses);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfileData();
    } else if (!userId) {
      navigate("/");
    }
  }, [userId, isAuthenticated, navigate]);

  const handleStartChat = async () => {
    if (!profileUser) return;
    
    try {
      const chat = await createChat(profileUser.id);
      navigate(`/chat`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen bg-foodle-background text-foodle-text flex w-full">
          <CourseSidebar onJoinCourse={() => setIsJoinDialogOpen(true)} />
          <SidebarInset className="flex-1">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 w-full">
              <div className="animate-pulse space-y-6">
                <div className="h-32 bg-gray-800 rounded-lg" />
                <div className="h-64 bg-gray-800 rounded-lg" />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!profileUser) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen bg-foodle-background text-foodle-text flex w-full">
          <CourseSidebar onJoinCourse={() => setIsJoinDialogOpen(true)} />
          <SidebarInset className="flex-1">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 w-full">
              <div className="food-card">
                <p className="text-center py-12">User not found</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-foodle-background text-foodle-text flex w-full">
        <CourseSidebar onJoinCourse={() => setIsJoinDialogOpen(true)} />
        
        <SidebarInset className="flex-1">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 w-full">
            {/* Profile header */}
            <div className="food-card mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={profileUser.profilePicture || "/placeholder.svg"} 
                  alt={profileUser.username} 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-foodle-text">{profileUser.username}</h1>
                      <div className="flex items-center mt-1">
                        <span className="text-orange-400 font-medium">{profileUser.karma} karma</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 md:mt-0">
                      {!isOwnProfile && (
                        <Button 
                          onClick={handleStartChat}
                          className="bg-foodle-accent hover:bg-foodle-accent-hover"
                        >
                          <MessageSquare className="h-5 w-5 mr-2" />
                          <span>Message</span>
                        </Button>
                      )}
                      {isOwnProfile && (
                        <Button 
                          variant="outline" 
                          className="bg-transparent border-gray-700 text-gray-400 hover:text-foodle-accent hover:bg-gray-800"
                        >
                          <Settings className="h-5 w-5 mr-2" />
                          <span>Edit Profile</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Enrolled Courses
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {userCourses.length > 0 ? (
                    userCourses.map(course => (
                      <Button 
                        key={course.id}
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 hover:bg-gray-700"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        {course.code} - {course.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-gray-400">No courses enrolled</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 bg-gray-800 w-full">
                <TabsTrigger value="posts" className="flex-1 data-[state=active]:bg-foodle-accent data-[state=active]:text-white">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1 data-[state=active]:bg-foodle-accent data-[state=active]:text-white">
                  Comments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts">
                {userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map(post => (
                      <Post key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="food-card flex flex-col items-center justify-center p-8">
                    <Image className="w-16 h-16 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-foodle-text mb-2">No Posts Yet</h3>
                    <p className="text-gray-500 mb-4 text-center">
                      {isOwnProfile ? 
                        "You haven't created any posts yet. Share your thoughts with the community!" :
                        "This user hasn't created any posts yet."}
                    </p>
                    {isOwnProfile && (
                      <Button 
                        onClick={() => navigate("/")}
                        className="bg-foodle-accent hover:bg-foodle-accent-hover"
                      >
                        Create Your First Post
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comments">
                <div className="food-card flex flex-col items-center justify-center p-8">
                  <Image className="w-16 h-16 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-foodle-text mb-2">Comments Coming Soon</h3>
                  <p className="text-gray-500 text-center">
                    We're working on displaying all comments from this user.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
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

export default Profile;
