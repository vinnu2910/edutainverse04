
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CourseAnalytics {
  id: string;
  title: string;
  instructor: string;
  difficulty: string;
  price: number;
  thumbnail: string;
  category: string;
  enrollmentCount: number;
  completionRate: number;
  averageProgress: number;
  totalDuration: string;
}

const AdminCourseAnalytics = () => {
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    averageCompletion: 0,
    activeCourses: 0,
    totalWatchTime: '0h'
  });

  useEffect(() => {
    fetchCourseAnalytics();
  }, []);

  const fetchCourseAnalytics = async () => {
    try {
      console.log('Fetching course analytics data...');
      
      // First, fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        return;
      }

      if (!coursesData) {
        console.log('No courses found');
        setLoading(false);
        return;
      }

      // Fetch all enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id, progress, user_id');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
      }

      // Fetch all modules and videos for duration calculation
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('id, course_id');

      const { data: videosData, error: videosError } = await supabase
        .from('module_videos')
        .select('module_id, duration');

      if (modulesError) console.error('Error fetching modules:', modulesError);
      if (videosError) console.error('Error fetching videos:', videosError);

      // Process course data to calculate analytics
      const processedCourses: CourseAnalytics[] = coursesData.map(course => {
        // Get enrollments for this course
        const courseEnrollments = enrollmentsData?.filter(e => e.course_id === course.id) || [];
        const enrollmentCount = courseEnrollments.length;
        
        // Calculate completion rate (progress >= 100)
        const completedEnrollments = courseEnrollments.filter(e => e.progress >= 100).length;
        const completionRate = enrollmentCount > 0 
          ? Math.round((completedEnrollments / enrollmentCount) * 100)
          : 0;

        // Calculate average progress
        const averageProgress = enrollmentCount > 0
          ? Math.round(courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollmentCount)
          : 0;

        // Calculate total duration from videos
        const courseModules = modulesData?.filter(m => m.course_id === course.id) || [];
        const courseVideos = videosData?.filter(v => 
          courseModules.some(m => m.id === v.module_id)
        ) || [];
        
        const totalMinutes = courseVideos.reduce((sum, video) => {
          // Parse duration string (e.g., "10:30" or "1:05:30")
          const parts = video.duration.split(':');
          if (parts.length === 2) {
            return sum + parseInt(parts[0]) + parseInt(parts[1]) / 60;
          } else if (parts.length === 3) {
            return sum + parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
          }
          return sum;
        }, 0);
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        const totalDuration = `${hours}h ${minutes}m`;

        return {
          id: course.id,
          title: course.title,
          instructor: course.instructor,
          difficulty: course.difficulty,
          price: course.price,
          thumbnail: course.thumbnail || '',
          category: course.category || course.difficulty,
          enrollmentCount,
          completionRate,
          averageProgress,
          totalDuration
        };
      });

      setCourseAnalytics(processedCourses);

      // Calculate overall statistics
      const totalEnrollments = enrollmentsData?.length || 0;
      const averageCompletion = processedCourses.length > 0
        ? Math.round(processedCourses.reduce((sum, course) => sum + course.completionRate, 0) / processedCourses.length)
        : 0;
      const activeCourses = processedCourses.length;

      // Calculate total watch time (simplified estimation)
      const totalWatchTimeHours = processedCourses.reduce((sum, course) => {
        const hours = parseInt(course.totalDuration.split('h')[0]) || 0;
        return sum + hours * course.enrollmentCount * 0.7; // Assume 70% watch rate
      }, 0);

      setStats({
        totalEnrollments,
        averageCompletion,
        activeCourses,
        totalWatchTime: `${Math.round(totalWatchTimeHours)}h`
      });

      console.log('Course analytics fetched successfully:', activeCourses, 'courses');
    } catch (error) {
      console.error('Error fetching course analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading course analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Course Analytics
          </h1>
          <p className="text-slate-600">Analyze course performance and student engagement</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalEnrollments.toLocaleString()}</div>
              <p className="text-xs text-slate-500">Across all courses</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Avg. Completion</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.averageCompletion}%</div>
              <p className="text-xs text-slate-500">Course completion rate</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Active Courses</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.activeCourses}</div>
              <p className="text-xs text-slate-500">Published courses</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Est. Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalWatchTime}</div>
              <p className="text-xs text-slate-500">Total estimated</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900">Course Performance</CardTitle>
            <CardDescription>Detailed analytics for each course</CardDescription>
          </CardHeader>
          <CardContent>
            {courseAnalytics.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">No courses found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {courseAnalytics.map((course) => (
                  <div key={course.id} className="border border-slate-100 rounded-lg p-6 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={course.thumbnail || '/placeholder.svg'} 
                          alt={course.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">{course.title}</h3>
                          <p className="text-sm text-slate-600">By {course.instructor}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Enrollments</p>
                        <p className="text-2xl font-bold text-slate-900">{course.enrollmentCount}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Completion Rate</p>
                        <p className="text-2xl font-bold text-slate-900">{course.completionRate}%</p>
                        <Progress value={course.completionRate} className="w-full mt-2" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Avg. Progress</p>
                        <p className="text-2xl font-bold text-slate-900">{course.averageProgress}%</p>
                        <Progress value={course.averageProgress} className="w-full mt-2" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Total Duration</p>
                        <p className="text-2xl font-bold text-slate-900">{course.totalDuration}</p>
                        <p className="text-xs text-slate-500 mt-1">Course length</p>
                      </div>
                    </div>
                    
                    {course.enrollmentCount > 0 && course.averageProgress < 50 && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>Attention:</strong> This course has low average progress. Consider reviewing content difficulty or adding more engaging materials.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminCourseAnalytics;
