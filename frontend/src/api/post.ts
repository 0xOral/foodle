import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000";

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface Post {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
}


export const createPost = async (postData: Omit<Post, "id" | "likes" | "comments" | "createdAt">): Promise<Post> => {
  try {
    const response = await fetch('http://localhost/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    
    const newPost = await response.json();
    toast.success("Post created successfully!");
    return newPost;
  } catch (error) {
    toast.error("Failed to create post");
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost/api/post/${postId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
    
    toast.success("Post deleted successfully!");
    return true;
  } catch (error) {
    toast.error("Failed to delete post");
    throw error;
  }
};

export const createComment = async (commentData: Omit<Comment, "id" | "createdAt">): Promise<Comment> => {
  try {
    const response = await fetch('http://localhost/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create comment');
    }
    
    const newComment = await response.json();
    toast.success("Comment added!");
    return newComment;
  } catch (error) {
    toast.error("Failed to add comment");
    throw error;
  }
};

export const deleteComment = async (postId: string, commentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost/api/comment/${commentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
    
    toast.success("Comment deleted!");
    return true;
  } catch (error) {
    toast.error("Failed to delete comment");
    throw error;
  }
};

export const getHomePosts = async (): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:5000/api/post/home`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
    
    toast.success("Comment deleted!");
    return response.json();
  } catch (error) {
    toast.error("Failed to delete comment");
    throw error;
  }
};

export const getMyPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`http://localhost:5000/api/post/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const posts = await response.json();
    return posts;
  } catch (error) {
    toast.error("Failed to fetch posts");
    throw error;
  }
};

export const getPostsByCourseId = async (courseId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/posts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const userData = await response.json();
    return userData.posts;
  } catch (error) {
    toast.error("Failed to fetch posts");
    throw error;
  }
};