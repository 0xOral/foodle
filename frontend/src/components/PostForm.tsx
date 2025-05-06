import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Send, Image, X } from "lucide-react";
import { Post } from "@/data/mockData";
import { getUserCourses } from "@/data/coursesData";
import { createPost, uploadImage } from "@/api/post";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PostFormProps {
  onPostCreated: (post: Post) => void;
  courseId?: string; // Optional courseId for when on a course page
}

const PostForm = ({ onPostCreated, courseId }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, isAuthenticated } = useAuth();

  // Get the user's enrolled courses
  const userCourses = currentUser ? getUserCourses(currentUser.id) : [];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      
      // Only include required fields
      const postData = {
        userId: currentUser.id,
        courseId: finalCourseId,
        content: content.trim(),
        image: imageUrl,
        isLiked: false
      };
      
      const newPost = await createPost(postData);
      onPostCreated(newPost);
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
            
            {imagePreview && (
              <div className="relative mt-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 rounded-md object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-gray-900 rounded-full hover:bg-gray-800"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}
            
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
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  ref={fileInputRef}
                  className="hidden"
                  disabled={!isAuthenticated || isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="bg-transparent border-gray-700 text-gray-400 hover:text-foodle-accent hover:bg-gray-800"
                  disabled={!isAuthenticated || isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-5 w-5 mr-2" />
                  <span>Add Image</span>
                </Button>
              </div>
              
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
