
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { courses } from "@/data/coursesData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface CourseJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CourseJoinDialog = ({ open, onOpenChange }: CourseJoinDialogProps) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const handleJoinCourse = (courseId: string) => {
    // In a real app, this would be an API call
    toast({
      title: "Course joined",
      description: "You have successfully enrolled in this course.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Course</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {courses.map((course) => {
            const isEnrolled = currentUser?.enrolledCourses.includes(course.id);
            
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
                  disabled={isEnrolled}
                  variant={isEnrolled ? "secondary" : "default"}
                >
                  {isEnrolled ? "Enrolled" : "Join"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseJoinDialog;
