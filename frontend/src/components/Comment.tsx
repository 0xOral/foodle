
import { useState } from "react";
import { findUserById } from "@/data/mockData";
import type { Comment as CommentType } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteComment } from "@/api/post";
import { toast } from "sonner";

interface CommentProps {
  comment: CommentType;
  isAuthor?: boolean;
  onDeleteComment: (commentId: string) => void;
  postId: string;
}

const Comment = ({ comment, isAuthor = false, onDeleteComment, postId }: CommentProps) => {
  const user = findUserById(comment.userId);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteComment(postId, comment.id);
      onDeleteComment(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 py-3 animate-fade-in">
      <img 
        src={user?.profilePicture || "/placeholder.svg"} 
        alt={user?.username || "User"} 
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foodle-text">{user?.username || "Unknown User"}</span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>
          
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-500 hover:bg-transparent h-6 w-6 p-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-300">{comment.content}</p>
      </div>
    </div>
  );
};

export default Comment;
