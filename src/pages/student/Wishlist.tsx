import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Clock, Trash2, Star, ShoppingCart } from 'lucide-react';
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
          courses!wishlist_course_id_fkey (*)
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
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent"></div>
            </div>
            <p className="text-slate-600 font-medium">Loading wishlist...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-pink-800 to-red-800 bg-clip-text text-transparent mb-4">
            My Wishlist
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Courses you want to take later - your learning goals await
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="w-16 h-16 text-slate-400" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-red-500/5 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Your wishlist is empty</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Browse courses and add them to your wishlist for later
            </p>
            <Link to="/student/courses">
              <Button size="lg" className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {wishlistItems.map((item) => {
              const course = item.courses;
              return (
                <Card key={item.id} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-lg overflow-hidden">
                  <div className="relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-lg ${
                        course.difficulty === 'Beginner' ? 'bg-green-500/90 text-white' :
                        course.difficulty === 'Average' ? 'bg-yellow-500/90 text-white' :
                        'bg-red-500/90 text-white'
                      }`}>
                        {course.difficulty}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWishlist(item.id, course.title)}
                        className="p-2 bg-white/90 backdrop-blur-lg text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full shadow-lg transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-sm line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.enrollment_count} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600">Instructor</p>
                      <p className="font-semibold text-slate-800">{course.instructor}</p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          ₹{course.price}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      {enrolledCourses.includes(course.id) ? (
                        <Link to={`/student/learn/${course.id}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                            Continue Learning
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          onClick={() => handleEnroll(course.id, course.title)}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Enroll Now
                        </Button>
                      )}
                      <Link to={`/student/courses/${course.id}`}>
                        <Button variant="outline" className="w-full border-slate-300 hover:border-pink-500 hover:bg-pink-50 transition-all duration-300">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentWishlist;
