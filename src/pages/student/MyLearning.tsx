
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, BookOpen, GraduationCap } from 'lucide-react';
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

interface Enrollment {
  course_id: string;
  progress: number;
  enrolled_at: string;
  courses: Course;
}

const StudentMyLearning = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('MyLearning: Fetching courses for user:', user.id);
      fetchEnrolledCourses();
    } else {
      console.log('MyLearning: No user found');
      setLoading(false);
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    if (!user) {
      console.log('MyLearning: No user available for course fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('MyLearning: Starting course fetch for user:', user.id);
      const { data, error } = await supabase
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
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('MyLearning: Error fetching enrolled courses:', error);
        return;
      }

      if (data) {
        console.log('MyLearning: Enrolled courses fetched successfully:', data.length, 'courses');
        setEnrolledCourses(data);
      } else {
        console.log('MyLearning: No enrolled courses found');
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error('MyLearning: Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
      console.log('MyLearning: Course fetch completed');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
            <p className="text-slate-600 font-medium">Loading your learning journey...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h2>
              <p className="text-slate-600">Please log in to view your courses.</p>
            </div>
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            My Learning Journey
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Continue your learning adventure and unlock new possibilities
          </p>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-16 h-16 text-slate-400" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Start Your Learning Adventure</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Discover amazing courses and begin your journey to mastery
            </p>
            <Link to="/student/courses">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {enrolledCourses.map((enrollment) => {
              const course = enrollment.courses;
              const progress = enrollment.progress || 0;
              
              return (
                <Card key={enrollment.course_id} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-lg overflow-hidden">
                  <div className="relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        course.difficulty === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {course.difficulty}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-medium">
                      By {course.instructor}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700">Progress</span>
                        <span className="text-sm font-bold text-blue-600">{progress}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={progress} className="h-2 bg-slate-100" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                             style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <Link to={`/student/learn/${course.id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <Play className="w-4 h-4 mr-2" />
                          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Button>
                      </Link>
                      <Link to={`/student/courses/${course.id}`}>
                        <Button variant="outline" className="w-full border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                          Course Details
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

export default StudentMyLearning;
