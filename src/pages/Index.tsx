
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../integrations/supabase/client';
import { BookOpen, Users, Award, Clock, Star, ChevronRight, Play, User, Heart, Zap, Globe, Target } from 'lucide-react';

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

const Index = () => {
  const { user } = useAuth();
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('Fetching courses for homepage...');
        
        const { data: popular, error: popularError } = await supabase
          .from('courses')
          .select('*')
          .order('enrollment_count', { ascending: false })
          .limit(3);

        const { data: recent, error: recentError } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (popularError) {
          console.error('Error fetching popular courses:', popularError);
        } else if (popular) {
          setPopularCourses(popular);
        }

        if (recentError) {
          console.error('Error fetching recent courses:', recentError);
        } else if (recent) {
          setRecentCourses(recent);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <Layout isPublic={!user}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">Loading amazing courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isPublic={!user}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f1f5f9" fill-opacity="0.4"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-medium backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              {user ? `Welcome back, ${user.name}!` : 'Transform Your Future'}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              {user ? (
                <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Continue Your Journey
                </span>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Learn Without
                  </span>
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Boundaries
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {user 
                ? 'Explore new skills and advance your expertise with our curated learning paths' 
                : 'Master new skills with expert-led courses, hands-on projects, and industry-recognized certificates'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <User className="w-5 h-5 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to={user.role === 'admin' ? '/admin/courses' : '/student/courses'}>
                    <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-lg px-8 py-6 h-auto transition-all duration-300">
                      Browse Courses
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/courses">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <Play className="w-5 h-5 mr-2" />
                      Start Learning
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-lg px-8 py-6 h-auto transition-all duration-300">
                      Join Free
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '15K+', label: 'Active Learners', color: 'from-blue-500 to-cyan-500' },
              { icon: BookOpen, value: '300+', label: 'Expert Courses', color: 'from-purple-500 to-pink-500' },
              { icon: Award, value: '98%', label: 'Success Rate', color: 'from-green-500 to-emerald-500' },
              { icon: Globe, value: '24/7', label: 'Global Access', color: 'from-orange-500 to-red-500' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Why Choose Edutainverse?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experience next-generation learning with our innovative platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Expert-Led Courses',
                description: 'Learn from industry professionals with years of real-world experience and proven expertise',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Users,
                title: 'Interactive Community',
                description: 'Connect with fellow learners, share knowledge, and grow together in our vibrant ecosystem',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Award,
                title: 'Certified Learning',
                description: 'Earn industry-recognized certificates that add real value to your professional profile',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">{feature.title}</CardTitle>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      {popularCourses.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Popular Courses
              </h2>
              <p className="text-xl text-slate-600">
                Join thousands of students in our most-loved courses
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {popularCourses.map((course) => (
                <Card key={course.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-white">
                  <div className="relative overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className={`text-sm font-semibold ${
                        course.difficulty === 'Beginner' ? 'text-green-600' :
                        course.difficulty === 'Average' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ₹{course.price}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-slate-500 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.enrollment_count} students</span>
                        </div>
                      </div>
                    </div>
                    <Link to={user ? (user.role === 'admin' ? '/admin/courses' : '/student/courses') : '/courses'} className="block mt-6">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                        View Course
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to={user ? (user.role === 'admin' ? '/admin/courses' : '/student/courses') : '/courses'}>
                <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 px-8 py-3 transition-all duration-300">
                  View All Courses
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user ? (
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of learners who are already advancing their careers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  Start Learning Today
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 h-auto transition-all duration-300">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Continue Your Journey
            </h2>
            <p className="text-xl text-blue-100">
              Access your personalized learning dashboard and explore new opportunities
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              {user.role === 'student' ? (
                <>
                  <Link to="/student/mylearning">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <BookOpen className="w-5 h-5 mr-2" />
                      My Learning
                    </Button>
                  </Link>
                  <Link to="/student/wishlist">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <Heart className="w-5 h-5 mr-2" />
                      Wishlist
                    </Button>
                  </Link>
                  <Link to="/student/profile">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <User className="w-5 h-5 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/admin/dashboard">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/admin/courses">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Manage Courses
                    </Button>
                  </Link>
                  <Link to="/admin/analytics/users">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <Award className="w-5 h-5 mr-2" />
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
