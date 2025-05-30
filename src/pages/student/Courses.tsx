
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, Clock, Heart, HeartOff, Filter, Star, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  actual_enrollment_count?: number;
}

const StudentCourses = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchEnrollments();
      fetchWishlist();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses for student...');
      
      // Fetch basic courses data
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }

      if (data) {
        // Fetch actual enrollment counts for each course
        const coursesWithCounts = await Promise.all(
          data.map(async (course) => {
            const { count, error: countError } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id);
              
            if (countError) {
              console.error('Error fetching enrollment count for course:', course.id, countError);
              return { ...course, actual_enrollment_count: 0 };
            }
            
            return { ...course, actual_enrollment_count: count || 0 };
          })
        );
        
        setCourses(coursesWithCounts);
        console.log('Student courses fetched successfully with actual enrollment counts:', coursesWithCounts.length);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching wishlist for user:', user.id);
      const { data, error } = await supabase
        .from('wishlist')
        .select('course_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      if (data) {
        setWishlist(data.map(item => item.course_id));
        console.log('Wishlist fetched:', data.length);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
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

      setEnrolledCourses([...enrolledCourses, courseId]);
      
      // Refresh courses to update enrollment count
      fetchCourses();
      
      toast({
        title: "Success!",
        description: "You have successfully enrolled in the course",
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

  const toggleWishlist = async (courseId: string) => {
    if (!user) return;

    try {
      if (wishlist.includes(courseId)) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (error) {
          console.error('Error removing from wishlist:', error);
          return;
        }

        setWishlist(wishlist.filter(id => id !== courseId));
        toast({
          title: "Removed from wishlist",
          description: "Course removed from your wishlist",
        });
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert([{
            user_id: user.id,
            course_id: courseId
          }]);

        if (error) {
          console.error('Error adding to wishlist:', error);
          return;
        }

        setWishlist([...wishlist, courseId]);
        toast({
          title: "Added to wishlist",
          description: "Course added to your wishlist",
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || course.difficulty === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">Loading amazing courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
      <Navbar />
      
      <div className="relative">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Discover Courses
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Explore our comprehensive collection of expert-led courses
            </p>
          </div>
          
          {/* Filters */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search courses, instructors, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 h-12 border-slate-200 focus:border-blue-500">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Difficulties</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Average">Average</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-white/90 backdrop-blur-sm">
                <div className="relative overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      course.difficulty === 'Beginner' ? 'bg-green-100/90 text-green-700' :
                      course.difficulty === 'Average' ? 'bg-yellow-100/90 text-yellow-700' :
                      'bg-red-100/90 text-red-700'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWishlist(course.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-300"
                  >
                    {wishlist.includes(course.id) ? (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    ) : (
                      <HeartOff className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">By {course.instructor}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-slate-600 font-medium">4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.actual_enrollment_count !== undefined 
                          ? course.actual_enrollment_count 
                          : course.enrollment_count} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{course.price}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    {enrolledCourses.includes(course.id) ? (
                      <Link to={`/student/learn/${course.id}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link to={`/student/courses/${course.id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                            View Details
                          </Button>
                        </Link>
                        <Button onClick={() => enrollInCourse(course.id)} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                          Enroll Now
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Courses Found</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Try adjusting your search criteria or browse all available courses
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
