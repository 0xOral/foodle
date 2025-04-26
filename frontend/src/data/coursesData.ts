
// Mock data for courses

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  instructor: string;
  enrolledStudents: string[]; // User IDs
}

export const courses: Course[] = [
  {
    id: "c1",
    code: "CS101",
    name: "Introduction to Computer Science",
    description: "Fundamental concepts of computer science and programming",
    instructor: "Prof. Anderson",
    enrolledStudents: ["1", "2", "3"]
  },
  {
    id: "c2",
    code: "CS201", 
    name: "Data Structures",
    description: "Study of common data structures and algorithms",
    instructor: "Prof. Martinez",
    enrolledStudents: ["1", "3"]
  },
  {
    id: "c3",
    code: "CS301",
    name: "Database Systems",
    description: "Design and implementation of database systems",
    instructor: "Prof. Johnson",
    enrolledStudents: ["2", "3"]
  },
  {
    id: "c4",
    code: "MATH101",
    name: "Calculus I",
    description: "Introduction to differential and integral calculus",
    instructor: "Prof. Taylor",
    enrolledStudents: ["1"]
  }
];

export const getUserCourses = (userId: string): Course[] => {
  return courses.filter(course => course.enrolledStudents.includes(userId));
};

export const getCourseById = (courseId: string): Course | undefined => {
  return courses.find(course => course.id === courseId);
};
