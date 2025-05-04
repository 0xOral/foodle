import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Send, Image } from "lucide-react";
import { Post } from "@/data/mockData";
import { getUserCourses } from "@/data/coursesData";
import { createPost } from "@/api/post";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PostFormProps {
  onPostCreated: (post: Post) => void;
  courseId?: string; // Optional courseId for when on a course page
}

const PostForm = ({ onPostCreated, courseId }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();

  // Get the user's enrolled courses
  const userCourses = currentUser ? getUserCourses(currentUser.id) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !currentUser) {
      toast.error("Please sign in to create posts");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Please write something before submitting");
      return;
    }
    
    const postCourseId = courseId || selectedCourseId;
    
    if (!postCourseId && userCourses.length > 0) {
      toast.error("Please select a course for your post");
      return;
    }
    
    const finalCourseId = postCourseId || (userCourses.length > 0 ? userCourses[0].id : "");
    
    setIsSubmitting(true);
    
    try {
      // Only include required fields
      const postData = {
        userId: currentUser.id,
        courseId: finalCourseId,
        content: content.trim()
      };
      
      const newPost = await createPost(postData);
      onPostCreated(newPost);
      setContent("");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="food-card mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <img 
            src={currentUser?.profilePicture || "/placeholder.svg"} 
            alt="Your profile" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <Textarea
              placeholder={isAuthenticated ? "What's on your mind?" : "Sign in to create a post"}
              className="min-h-20 resize-none bg-gray-800 border-gray-700 text-foodle-text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!isAuthenticated || isSubmitting}
            />
            
            {!courseId && userCourses.length > 0 && (
              <div className="mt-3">
                <Select 
                  value={selectedCourseId} 
                  onValueChange={setSelectedCourseId}
                  disabled={!isAuthenticated || isSubmitting}
                >
                  <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {userCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex justify-between mt-3">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-gray-700 text-gray-400 hover:text-foodle-accent hover:bg-gray-800"
                disabled={!isAuthenticated || isSubmitting}
              >
                <Image className="h-5 w-5 mr-2" />
                <span>Add Image</span>
              </Button>
              
              <Button 
                type="submit" 
                className="bg-foodle-accent hover:bg-foodle-accent-hover"
                disabled={!isAuthenticated || !content.trim() || isSubmitting}
              >
                <Send className="h-5 w-5 mr-2" />
                <span>{isSubmitting ? "Posting..." : "Post"}</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
