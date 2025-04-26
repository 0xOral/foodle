
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PostForm from "@/components/PostForm";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Users } from "lucide-react";
import CourseSidebar from "@/components/CourseSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CourseJoinDialog from "@/components/CourseJoinDialog";
import { getPostsByCourseId, Post as PostType } from "@/api/post";
import Post from "@/components/Post";
import { getCourseById, type Course } from "@/api/courses";


const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [coursePosts, setCoursePosts] = useState<PostType[]>([]);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  console.log("Course");
  const course = courseId ? getCourseById(courseId) : undefined;  
  console.log("course", course);
  useEffect(() => {
    if (!courseId) {
      navigate("/");
      return;
    }
    
    const loadPosts = async () => {
      const posts = await getPostsByCourseId(courseId);
      console.log(posts);
      setCoursePosts(posts);
    };
    loadPosts();
  }, [courseId, navigate]);

  const handlePostCreated = (newPost: PostType) => {
    setCoursePosts(prev => [newPost, ...prev]);
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-foodle-background text-foodle-text">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="food-card">
            <p className="text-center py-12">Course not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-foodle-background text-foodle-text flex">
        <CourseSidebar 
          activeCourseId={courseId} 
          onJoinCourse={() => setIsJoinDialogOpen(true)}
        />
        
        <SidebarInset className="flex-1">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
            {/* Course header */}
            <div className="food-card mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-foodle-accent" />
                  <div>
                    <h1 className="text-2xl font-bold text-foodle-text">
                      {course.code}: {course.name}
                    </h1>
                    <p className="text-gray-400">Instructor: course instructor</p>
                  </div>
                </div>
                
                <p className="text-foodle-text">{course.description}</p>
                
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolledStudents.length} students enrolled</span>
                </div>
              </div>
            </div>
            
            {/* Post creation form */}
            {isAuthenticated && currentUser && course.enrolledStudents.includes(currentUser.id) && (
              <PostForm onPostCreated={handlePostCreated} courseId={courseId} />
            )}
            
            {/* Course posts */}
            <div className="space-y-6 mt-6">
              {coursePosts.length > 0 ? (
                coursePosts.map(post => (
                  <Post key={post.id} post={post} />
                ))
              ) : (
                <div className="food-card flex flex-col items-center justify-center p-8">
                  <BookOpen className="w-16 h-16 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-foodle-text mb-2">No Posts Yet</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    Be the first to start a discussion in this course!
                  </p>
                  {isAuthenticated && currentUser && course.enrolledStudents.includes(currentUser.id) && (
                    <p className="text-gray-400 text-center">
                      Use the form above to create the first post.
                    </p>
                  )}
                </div>
              )}
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

export default Course;
