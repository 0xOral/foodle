import { toast } from "sonner";

export const API_BASE_URL = "http://localhost:5000";

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
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  username: string;
  likes: number;
}


export const createPost = async (postData: Omit<Post, "id" | "likes" | "comments" | "createdAt">): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
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
    const response = await fetch(`${API_BASE_URL}/api/post`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ postId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete post');
    }
    
    toast.success("Post deleted successfully!");
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    return false;
  }
};

export const createComment = async (commentData: { postId: string; content: string }): Promise<Comment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(commentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create comment');
    }
    
    const result = await response.json();
    toast.success("Comment added!");
    return result.comment;
  } catch (error) {
    toast.error("Failed to add comment");
    throw error;
  }
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comment`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ commentId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete comment');
    }
    
    toast.success("Comment deleted successfully!");
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    return false;
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
      throw new Error('Failed to fetch posts');
    }
    
    return response.json();
  } catch (error) {
    toast.error("Failed to fetch posts");
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

export const likePost = async (postId: string): Promise<{ id: string; likes: number; isLiked: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/post/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to like post');
    }
    
    const result = await response.json();
    return result.post;
  } catch (error) {
    toast.error("Failed to like post");
    throw error;
  }
};

export const getLikedPosts = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/liked`, {
      headers: {
        ...getAuthHeader(),
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch liked posts');
    }
    
    const result = await response.json();
    return result.liked_posts;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    toast.error("Failed to upload image");
    throw error;
  }
};