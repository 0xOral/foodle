import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { createComment, type Comment } from "@/api/post";

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: Comment) => void;
}

const CommentForm = ({ postId, onCommentAdded }: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !currentUser) {
      toast.error("Please sign in to comment on posts");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Please write something before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newComment = await createComment({
        postId,
        content: content.trim()
      });
      
      onCommentAdded(newComment);
      setContent("");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <img 
          src={currentUser?.profilePicture || "/placeholder.svg"} 
          alt="Your profile" 
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 flex gap-2">
          <Textarea
            placeholder={isAuthenticated ? "Add a comment..." : "Sign in to comment"}
            className="min-h-10 resize-none bg-gray-800 border-gray-700 text-foodle-text flex-1"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isAuthenticated || isSubmitting}
          />
          <Button 
            type="submit" 
            size="sm"
            className="bg-foodle-accent hover:bg-foodle-accent-hover self-end"
            disabled={!isAuthenticated || !content.trim() || isSubmitting}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
