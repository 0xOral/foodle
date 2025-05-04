import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Post as PostType, findUserById } from "@/data/mockData";
import { getCourseById } from "@/data/coursesData";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Heart, BookOpen, Trash2 } from "lucide-react";
import { deletePost, likePost } from "@/api/post";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface PostProps {
  post: PostType;
  onPostDeleted?: () => void;
}

const Post = ({ post, onPostDeleted }: PostProps) => {
  const [currentPost, setCurrentPost] = useState<PostType>({
    ...post,
    likes: post.likes || 0,
    isLiked: post.isLiked || false
  });
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const user = findUserById(post.userId);
  const course = getCourseById(post.courseId);
  const { isAuthenticated, currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if the current user is the author of the post
  const isAuthor = currentUser && String(currentUser.id) === String(post.userId);
  
  console.log('Post Debug:', {
    currentUserId: currentUser?.id,
    postUserId: post.userId,
    isAuthor,
    currentUser,
    post
  });
  
  // Format the date
  const formatDate = (dateString: string) => {
    dateString = "2024-04-26T15:30:00Z"
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (isLiking) return;
    
    try {
      setIsLiking(true);
      const updatedPost = await likePost(currentPost.id);
      setCurrentPost(prev => ({
        ...prev,
        likes: updatedPost.likes,
        isLiked: updatedPost.isLiked
      }));
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleAddComment = (newComment: any) => {
    setCurrentPost(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
    
    // Show comments when a new comment is added
    setShowComments(true);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  const handleDeleteComment = (commentId: string) => {
    setCurrentPost(prev => ({
      ...prev,
      comments: prev.comments.filter(comment => comment.id !== commentId)
    }));
  };
  
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      const success = await deletePost(post.id);
      if (success && onPostDeleted) {
        onPostDeleted();
      }
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="food-card mb-6 animate-enter">
        <div className="flex items-start gap-3">
          <img 
            src={user?.profilePicture || "/placeholder.svg"} 
            alt={user?.username || "User"} 
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={() => user && handleUserClick(user.id)}
          />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <Link to={`/profile/${user?.id}`} className="font-medium text-foodle-text hover:text-foodle-accent transition-colors">
                  {user?.username || "Unknown User"}
                </Link>
                <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {course && (
                  <Link to={`/course/${course.id}`} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800 text-xs text-gray-300 hover:bg-gray-700">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{course.code}</span>
                  </Link>
                )}
                
                {isAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-gray-400 hover:text-red-500 hover:bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-2 text-foodle-text">{currentPost.content}</p>
            
            {currentPost.image && (
              <div className="mt-3 rounded-md overflow-hidden">
                <img 
                  src={currentPost.image} 
                  alt="Post content" 
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}
            
            <div className="flex items-center gap-6 mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  "flex items-center gap-2 hover:bg-transparent",
                  isLiking ? "text-gray-400" : "text-gray-400 hover:text-foodle-accent"
                )}
              >
                <Heart className={cn(
                  "h-5 w-5",
                  currentPost.isLiked && "fill-foodle-accent text-foodle-accent"
                )} />
                <span>{currentPost.likes}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-400 hover:text-foodle-accent hover:bg-transparent"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{currentPost.comments.length}</span>
              </Button>
            </div>
            
            {showComments && (
              <div className="mt-4">
                <Separator className="bg-gray-800" />
                <div className="mt-3">
                  {currentPost.comments.length > 0 ? (
                    currentPost.comments.map(comment => (
                      <Comment 
                        key={comment.id} 
                        comment={comment}
                        isAuthor={comment.userId === currentUser?.id}
                        onDeleteComment={handleDeleteComment}
                        postId={currentPost.id}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-2">No comments yet. Be the first to comment!</p>
                  )}
                </div>
                <CommentForm postId={currentPost.id} onCommentAdded={handleAddComment} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Post;
