
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { calculateKarma } from "@/data/mockData";
import { getUserCourses } from "@/data/coursesData";

const ProfileCard = () => {
  const { currentUser } = useAuth();
  
  const karma = currentUser ? calculateKarma(currentUser.id) : 0;
  const userCourses = currentUser ? getUserCourses(currentUser.id) : [];

  return (
    <div className="food-card">
      <div className="flex flex-col items-center">
        <img 
          src={currentUser?.profilePicture || "/placeholder.svg"} 
          alt="Profile" 
          className="w-20 h-20 rounded-full object-cover mb-4"
        />
        <h2 className="text-xl font-bold text-foodle-text">{currentUser?.username || "User"}</h2>
        
        <div className="w-full mt-6 text-center">
          <div className="mb-4">
            <p className="text-xl font-bold text-orange-400">{karma}</p>
            <p className="text-sm text-gray-500">Karma</p>
          </div>
        </div>
        
        <div className="w-full mt-2">
          <h3 className="text-sm font-medium flex items-center mb-2">
            <BookOpen className="mr-2 h-4 w-4" />
            My Courses
          </h3>
          {userCourses.length > 0 ? (
            <div className="space-y-2">
              {userCourses.slice(0, 3).map(course => (
                <Link 
                  key={course.id}
                  to={`/course/${course.id}`} 
                  className="block py-1.5 px-2 text-sm rounded-md hover:bg-gray-800 text-gray-300"
                >
                  {course.code} - {course.name}
                </Link>
              ))}
              {userCourses.length > 3 && (
                <Link 
                  to="/profile" 
                  className="block text-xs text-foodle-accent text-right mt-1 hover:underline"
                >
                  See all courses ({userCourses.length})
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">No courses enrolled</p>
          )}
        </div>
        
        <Link to="/profile"> 
          <Button 
            variant="outline" 
            className="w-full mt-6 bg-transparent border-gray-700 text-gray-400 hover:text-foodle-accent hover:bg-gray-800"
          >
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileCard;
