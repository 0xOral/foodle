import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getAllCourses, joinCourse, Course, getMyCourses } from "@/api/courses";

interface CourseJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CourseJoinDialog = ({ open, onOpenChange }: CourseJoinDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningCourse, setJoiningCourse] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getAllCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchCourses();
    }
  }, [open]);
  
  const handleJoinCourse = async (courseId: string) => {
    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to join a course",
        variant: "destructive"
      });
      return;
    }

    setJoiningCourse(courseId);
    try {
      await joinCourse(courseId);
      const updatedCourses = await getAllCourses();
      console.log("updatedCourses", updatedCourses);
      setCourses(updatedCourses);
      onOpenChange(false);
      currentUser.enrolledCourses.push(courseId);
      navigate(`/course/${courseId}`);
      
    } catch (error) {
      console.error("Failed to join course:", error);
    } finally {
      setJoiningCourse(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Join a Course</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="grid gap-4 py-4">
            {loading ? (
              <div className="text-center">Loading courses...</div>
            ) : (
              courses.map((course) => {
                const isEnrolled = currentUser?.enrolledCourses.includes(course.id);
                const isJoining = joiningCourse === course.id;
                
                return (
                  <div 
                    key={course.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-card"
                  >
                    <div>
                      <h3 className="font-semibold">{course.code}</h3>
                      <p className="text-sm text-muted-foreground">{course.name}</p>
                    </div>
                    <Button
                      onClick={() => handleJoinCourse(course.id)}
                      disabled={isEnrolled || isJoining}
                      variant={isEnrolled ? "secondary" : "default"}
                    >
                      {isEnrolled ? "Enrolled" : isJoining ? "Joining..." : "Join"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseJoinDialog;