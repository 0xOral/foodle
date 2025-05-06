export interface User {
  id: string;
  username: string;
  profilePicture: string;
  karma: number;
  enrolledCourses: string[]; // Course IDs
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  image?: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  comments: Comment[];
}

export const users: User[] = [
  {
    id: "1",
    username: "foodlover123",
    profilePicture: "/placeholder.svg",
    karma: 245,
    enrolledCourses: ["c1", "c2", "c4"]
  },
  {
    id: "2",
    username: "chefsdelight",
    profilePicture: "/placeholder.svg",
    karma: 189,
    enrolledCourses: ["c1", "c3"]
  },
  {
    id: "3",
    username: "tastytreats",
    profilePicture: "/placeholder.svg",
    karma: 327,
    enrolledCourses: ["c1", "c2", "c3"]
  }
];

export const posts: Post[] = [
  {
    id: "1",
    userId: "1",
    courseId: "c1",
    content: "Just made the most amazing homemade pasta! The secret is in the sauce 🍝",
    image: "/placeholder.svg",
    likes: 24,
    createdAt: "2025-04-23T14:30:00Z",
    comments: [
      {
        id: "101",
        userId: "2",
        postId: "1",
        content: "That looks incredible! Would love to get the recipe.",
        createdAt: "2025-04-23T15:05:00Z"
      },
      {
        id: "102",
        userId: "3",
        postId: "1",
        content: "Beautiful plating! What kind of sauce is that?",
        createdAt: "2025-04-23T15:45:00Z"
      }
    ]
  },
  {
    id: "2",
    userId: "2",
    courseId: "c2",
    content: "Tried a new sourdough recipe this weekend. The crumb is perfect! 🍞",
    image: "/placeholder.svg",
    likes: 18,
    createdAt: "2025-04-22T09:15:00Z",
    comments: [
      {
        id: "103",
        userId: "1",
        postId: "2",
        content: "That's some serious bread goals right there!",
        createdAt: "2025-04-22T10:20:00Z"
      }
    ]
  },
  {
    id: "3",
    userId: "3",
    courseId: "c1",
    content: "Found this amazing little bistro downtown. Their crème brûlée is to die for! 🍮",
    image: "/placeholder.svg",
    likes: 31,
    createdAt: "2025-04-21T18:45:00Z",
    comments: []
  }
];

export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const findPostById = (id: string): Post | undefined => {
  return posts.find(post => post.id === id);
};

export const getPostsByUserId = (userId: string): Post[] => {
  return posts.filter(post => post.userId === userId);
};

export const getPostsByCourseId = (courseId: string): Post[] => {
  
  return posts.filter(post => post.courseId === courseId);
};

export const calculateKarma = (userId: string): number => {
  // Find the user
  const user = findUserById(userId);
  if (!user) return 0;
  
  // Start with base karma
  let karma = user.karma;
  
  // Add karma for posts
  const userPosts = getPostsByUserId(userId);
  karma += userPosts.length * 5; // 5 karma points per post
  
  // Add karma for comments
  const userComments = posts.flatMap(post => 
    post.comments.filter(comment => comment.userId === userId)
  );
  karma += userComments.length * 2; // 2 karma points per comment
  
  // Add karma for likes received
  const likesReceived = userPosts.reduce((sum, post) => sum + post.likes, 0);
  karma += likesReceived;
  
  return karma;
};
