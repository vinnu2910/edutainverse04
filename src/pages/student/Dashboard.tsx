
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Heart, User, Play, TrendingUp, Award, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface Enrollment {
  course_id: string;
  progress: number;
  enrolled_at: string;
  courses: Course;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('Dashboard: Fetching data for user:', user.id);
      fetchDashboardData();
    } else {
      console.log('Dashboard: No user found');
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('Dashboard: No user available for data fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Dashboard: Starting data fetch for user:', user.id);
      
      // Fetch enrolled courses with specific foreign key relationship
      console.log('Dashboard: Fetching enrollments...');
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          progress,
          enrolled_at,
          courses!enrollments_course_id_fkey (
            id,
            title,
            description,
            instructor,
            difficulty,
            price,
            duration,
            thumbnail,
            category,
            enrollment_count
          )
        `)
        .eq('user_id', user.id);

      if (enrollmentError) {
        console.error('Dashboard: Error fetching enrollments:', enrollmentError);
      } else {
        console.log('Dashboard: Enrollments fetched successfully:', enrollments);
        if (enrollments && enrollments.length > 0) {
          setEnrolledCourses(enrollments);
          const completed = enrollments.filter(e => e.progress >= 100).length;
          setCompletedCount(completed);
          console.log('Dashboard: Found', enrollments.length, 'enrollments,', completed, 'completed');
        } else {
          console.log('Dashboard: No enrollments found for user');
          setEnrolledCourses([]);
          setCompletedCount(0);
        }
      }

      // Fetch wishlist count with detailed logging
      console.log('Dashboard: Fetching wishlist...');
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id);

      if (wishlistError) {
        console.error('Dashboard: Error fetching wishlist:', wishlistError);
      } else {
        console.log('Dashboard: Wishlist fetched successfully:', wishlist);
        if (wishlist) {
          setWishlistCount(wishlist.length);
          console.log('Dashboard: Found', wishlist.length, 'wishlist items');
        } else {
          setWishlistCount(0);
        }
      }

    } catch (error) {
      console.error('Dashboard: Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      console.log('Dashboard: Data fetch completed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <User className="w-16 h-16 mx-auto text-slate-400" />
            <p className="text-slate-600 font-medium">Please log in to view your dashboard.</p>
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
          {/* Hero Welcome Section */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-medium backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              Welcome Back!
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Hello, {user.name}!
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Continue your learning journey and achieve your goals
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Enrolled Courses</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">{enrolledCourses.length}</div>
                <p className="text-sm text-slate-500">Active learning paths</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">{completedCount}</div>
                <p className="text-sm text-slate-500">Courses finished</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Wishlist</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">{wishlistCount}</div>
                <p className="text-sm text-slate-500">Saved for later</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <Link to="/student/mylearning">
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-lg">My Learning</h3>
                  <p className="text-blue-100 text-sm mt-1">Continue courses</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/student/courses">
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-lg">Browse Courses</h3>
                  <p className="text-purple-100 text-sm mt-1">Find new skills</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/student/wishlist">
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-pink-500 to-pink-600 text-white cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-lg">Wishlist</h3>
                  <p className="text-pink-100 text-sm mt-1">Saved courses</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/student/profile">
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer">
                <CardContent className="p-6 text-center">
                  <User className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-lg">Profile</h3>
                  <p className="text-green-100 text-sm mt-1">Manage account</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Continue Learning Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Continue Learning
              </h2>
              {enrolledCourses.length > 4 && (
                <Link to="/student/mylearning">
                  <Button variant="outline" className="border-slate-300 hover:border-blue-500 hover:bg-blue-50">
                    View All
                  </Button>
                </Link>
              )}
            </div>
            
            {enrolledCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {enrolledCourses.slice(0, 4).map((enrollment) => {
                  const course = enrollment.courses;
                  return (
                    <Card key={enrollment.course_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-slate-900 mb-2">{course.title}</CardTitle>
                            <CardDescription className="text-slate-600">By {course.instructor}</CardDescription>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                              course.difficulty === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {course.difficulty}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-slate-700">Progress</span>
                            <span className="font-bold text-blue-600">{enrollment.progress || 0}%</span>
                          </div>
                          <Progress value={enrollment.progress || 0} className="w-full h-3" />
                        </div>
                        <Link to={`/student/learn/${course.id}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Play className="w-4 h-4 mr-2" />
                            Continue Learning
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Start Your Learning Journey</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    Discover amazing courses and begin building new skills today
                  </p>
                  <Link to="/student/courses">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      Browse Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
