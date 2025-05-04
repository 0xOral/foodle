import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000";

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  instructor: string;
  enrolledStudents: string[];
}

export const getAllCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user courses');
    }
    const userData = await response.json();
    return userData.courses;
  } catch (error) {
    toast.error("Failed to fetch your courses");
    throw error;
  }
};

export const getMyCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/my`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user courses');
    }
    const userData = await response.json();
    return userData.courses;
  } catch (error) {
    toast.error("Failed to fetch your courses");
    throw error;
  }
};

export const getCourseById = async (courseId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch course info');   
    }
    const courseData = await response.json();
    return courseData.course;
  } catch (error) {
    toast.error("Failed to fetch course info");
    throw error;
  }
};

export const fetchCourseById = async (courseId: string) => {
  try {
    const response = await fetch(`http://localhost/api/courses/${courseId}`);
    if (!response.ok) {
      throw new Error('Course not found');
    }
    return await response.json();
  } catch (error) {
    toast.error("Course not found");
    throw error;
  }
};

export const joinCourse = async (courseId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ courseId: courseId}),
    });
    
    if (!response.ok) {
      throw new Error('Failed to join coursea');
    }
    
    const result = await response.json();
    toast.success(`${result.message}`);
    return result;
  } catch (error) {
    toast.error("Failed to join courseu");
    throw error;
  }
};

export const leaveCourse = async (courseId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/unenroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ courseId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to leave course');
    }
    
    const result = await response.json();
    toast.success(`Successfully left ${result.course.name}`);
    return result;
  } catch (error) {
    toast.error("Failed to leave course");
    throw error;
  }
};