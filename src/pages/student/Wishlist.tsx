
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Clock, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  price: number;
  duration: string;
  thumbnail: string;
  category: string;
  enrollment_count: number;
}

interface WishlistItem {
  id: string;
  course_id: string;
  courses: Course;
}

const StudentWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchEnrollments();
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      console.log('Fetching wishlist for user:', user.id);
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          course_id,
          courses (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      if (data) {
        setWishlistItems(data);
        console.log('Wishlist fetched successfully:', data.length);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching enrollments for user:', user.id);
      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching enrollments:', error);
        return;
      }

      if (data) {
        setEnrolledCourses(data.map(enrollment => enrollment.course_id));
        console.log('Enrollments fetched:', data.length);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const removeFromWishlist = async (wishlistItemId: string, courseTitle: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        toast({
          title: "Error",
          description: "Failed to remove course from wishlist",
          variant: "destructive",
        });
        return;
      }

      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItemId));
      toast({
        title: "Removed from wishlist",
        description: `${courseTitle} removed from your wishlist`,
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    if (!user) return;

    try {
      console.log('Enrolling in course:', courseId);
      const { error } = await supabase
        .from('enrollments')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          progress: 0
        }]);

      if (error) {
        console.error('Error enrolling in course:', error);
        toast({
          title: "Error",
          description: "Failed to enroll in course",
          variant: "destructive",
        });
        return;
      }

      // Remove from wishlist after successful enrollment
      const wishlistItem = wishlistItems.find(item => item.course_id === courseId);
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id, courseTitle);
      }

      setEnrolledCourses([...enrolledCourses, courseId]);
      toast({
        title: "Enrolled successfully!",
        description: `You are now enrolled in ${courseTitle}`,
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-600">Courses you want to take later</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Browse courses and add them to your wishlist</p>
            <Link to="/student/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const course = item.courses;
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWishlist(item.id, course.title)}
                        className="p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium w-fit ${
                      course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      course.difficulty === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.difficulty}
                    </span>
                    <CardDescription className="text-sm mt-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.enrollment_count} students
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Instructor: {course.instructor}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-600">
                        ₹{course.price}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {enrolledCourses.includes(course.id) ? (
                        <Link to={`/student/learn/${course.id}`}>
                          <Button className="w-full">Continue Learning</Button>
                        </Link>
                      ) : (
                        <Button 
                          onClick={() => handleEnroll(course.id, course.title)}
                          className="w-full"
                        >
                          Enroll Now
                        </Button>
                      )}
                      <Link to={`/student/courses/${course.id}`}>
                        <Button variant="outline" className="w-full">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentWishlist;
