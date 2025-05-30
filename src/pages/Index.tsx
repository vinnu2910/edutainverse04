import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../integrations/supabase/client'; // Adjust path as needed
import { BookOpen, Users, Award, Clock, Star, ChevronRight, Play, User, Heart } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const [popularCourses, setPopularCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      // Use correct field names as per your table schema
      const { data: popular, error: popularError } = await supabase
        .from('courses')
        .select('*')
        .order('enrollment_count', { ascending: false }) // <-- adjust field name
        .limit(3);

      const { data: recent, error: recentError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false }) // <-- adjust field name
        .limit(3);

      if (!popularError && popular) setPopularCourses(popular);
      if (!recentError && recent) setRecentCourses(recent);
    };
    fetchCourses();
  }, []);

  return (
    <Layout isPublic={!user}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              {user ? `Welcome back, ${user.name}!` : 'Learn Without'}
              {!user && (
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Limits
                </span>
              )}
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {user 
                ? 'Continue your learning journey and explore new courses' 
                : 'Transform your career with expert-led courses, hands-on projects, and industry-recognized certificates'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                // Logged in user buttons
                <>
                  <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      <User className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to={user.role === 'admin' ? '/admin/courses' : '/student/courses'}>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      Browse Courses
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                // Public user buttons
                <>
                  <Link to="/courses">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      <Play className="w-5 h-5 mr-2" />
                      Start Learning Today
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      Sign Up Free
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600">200+</div>
              <div className="text-gray-600">Expert Courses</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-indigo-600">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">Why Choose EduLMS?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience learning like never before with our cutting-edge platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Expert-Led Courses</CardTitle>
                <CardDescription className="text-base">
                  Learn from industry professionals with years of real-world experience
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Interactive Community</CardTitle>
                <CardDescription className="text-base">
                  Connect with fellow learners and get support from our vibrant community
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Certified Learning</CardTitle>
                <CardDescription className="text-base">
                  Earn industry-recognized certificates to advance your career
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">Popular Courses</h2>
            <p className="text-xl text-gray-600">
              Join thousands of students in our most-loved courses
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {popularCourses.map((course) => (
              <Card key={course.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-sm font-medium text-blue-600">{course.difficulty}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-sm text-gray-500">({course.enrollmentCount})</span>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{course.price}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>6 weeks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.enrollmentCount} students</span>
                      </div>
                    </div>
                  </div>
                  <Link to={user ? (user.role === 'admin' ? '/admin/courses' : '/student/courses') : '/courses'} className="block mt-4">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      View Course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to={user ? (user.role === 'admin' ? '/admin/courses' : '/student/courses') : '/courses'}>
              <Button size="lg" variant="outline" className="border-blue-200 hover:bg-blue-50">
                View All Courses
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Uploaded Courses Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">Recently Uploaded Courses</h2>
            <p className="text-xl text-gray-600">
              Check out the latest additions to our course library
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {recentCourses.map((course) => (
              <Card key={course.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-sm font-medium text-blue-600">{course.difficulty}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-sm text-gray-500">({course.enrollmentCount})</span>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{course.price}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>6 weeks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.enrollmentCount} students</span>
                      </div>
                    </div>
                  </div>
                  <Link to={user ? (user.role === 'admin' ? '/admin/courses' : '/student/courses') : '/courses'} className="block mt-4">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      View Course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to={user ? (user.role === 'admin' ? '/admin/courses' : '/student/courses') : '/courses'}>
              <Button size="lg" variant="outline" className="border-blue-200 hover:bg-blue-50">
                View All Courses
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-logged in users */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of learners who are already transforming their careers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Quick Access Section for Logged in Users */}
      {user && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Quick Access
            </h2>
            <p className="text-xl text-blue-100">
              Jump back into your learning or explore new features
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {user.role === 'student' ? (
                <>
                  <Link to="/student/mylearning">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      <BookOpen className="w-5 h-5 mr-2" />
                      My Learning
                    </Button>
                  </Link>
                  <Link to="/student/wishlist">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      <Heart className="w-5 h-5 mr-2" />
                      Wishlist
                    </Button>
                  </Link>
                  <Link to="/student/profile">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      <User className="w-5 h-5 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/admin/dashboard">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/admin/courses">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Manage Courses
                    </Button>
                  </Link>
                  <Link to="/admin/analytics/users">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                      Analytics
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
