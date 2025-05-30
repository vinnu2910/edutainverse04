
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: 0
  });
  const [mostEnrolledCourse, setMostEnrolledCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AdminDashboard: Starting data fetch');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('AdminDashboard: Fetching admin dashboard data...');
      
      // Fetch total users with detailed logging
      console.log('AdminDashboard: Fetching users count...');
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('AdminDashboard: Error fetching users count:', usersError);
      } else {
        console.log('AdminDashboard: Users count:', usersCount);
      }

      // Fetch total courses with detailed logging
      console.log('AdminDashboard: Fetching courses count...');
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      if (coursesError) {
        console.error('AdminDashboard: Error fetching courses count:', coursesError);
      } else {
        console.log('AdminDashboard: Courses count:', coursesCount);
      }

      // Fetch total enrollments with detailed logging
      console.log('AdminDashboard: Fetching enrollments count...');
      const { count: enrollmentsCount, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      if (enrollmentsError) {
        console.error('AdminDashboard: Error fetching enrollments count:', enrollmentsError);
      } else {
        console.log('AdminDashboard: Enrollments count:', enrollmentsCount);
      }

      // Calculate completion rate (enrollments with 100% progress)
      console.log('AdminDashboard: Fetching completed enrollments...');
      const { count: completedCount, error: completedError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .gte('progress', 100);

      if (completedError) {
        console.error('AdminDashboard: Error fetching completed enrollments:', completedError);
      } else {
        console.log('AdminDashboard: Completed enrollments count:', completedCount);
      }

      // Fetch most enrolled course with detailed logging
      console.log('AdminDashboard: Fetching most enrolled course...');
      const { data: mostEnrolled, error: mostEnrolledError } = await supabase
        .from('courses')
        .select('*')
        .order('enrollment_count', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mostEnrolledError) {
        console.error('AdminDashboard: Error fetching most enrolled course:', mostEnrolledError);
      } else {
        console.log('AdminDashboard: Most enrolled course:', mostEnrolled);
        setMostEnrolledCourse(mostEnrolled);
      }

      // Calculate completion rate percentage
      const completionRate = enrollmentsCount && completedCount 
        ? Math.round((completedCount / enrollmentsCount) * 100)
        : 0;

      const finalStats = {
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        totalEnrollments: enrollmentsCount || 0,
        completionRate
      };

      console.log('AdminDashboard: Final stats:', finalStats);
      setStats(finalStats);

    } catch (error) {
      console.error('AdminDashboard: Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      console.log('AdminDashboard: Data fetch completed');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
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
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Welcome back, {user?.name}! Here's your platform overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-slate-500">Registered users</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalCourses}</div>
              <p className="text-xs text-slate-500">Available courses</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalEnrollments.toLocaleString()}</div>
              <p className="text-xs text-slate-500">Course enrollments</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.completionRate}%</div>
              <p className="text-xs text-slate-500">Average completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/courses">
            <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
              Manage Courses
            </Button>
          </Link>
          <Link to="/admin/analytics/users">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-slate-200 hover:bg-slate-50">
              <Users className="w-6 h-6" />
              User Analytics
            </Button>
          </Link>
          <Link to="/admin/analytics/courses">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-slate-200 hover:bg-slate-50">
              <BarChart3 className="w-6 h-6" />
              Course Analytics
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-slate-200 hover:bg-slate-50">
            <TrendingUp className="w-6 h-6" />
            Reports
          </Button>
        </div>

        {/* Most Popular Course */}
        {mostEnrolledCourse && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900">Most Enrolled Course</CardTitle>
              <CardDescription>Your most popular course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <img 
                  src={mostEnrolledCourse.thumbnail} 
                  alt={mostEnrolledCourse.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{mostEnrolledCourse.title}</h3>
                  <p className="text-sm text-slate-600">By {mostEnrolledCourse.instructor}</p>
                  <p className="text-sm text-slate-500">{mostEnrolledCourse.enrollment_count} students enrolled</p>
                </div>
                <Link to={`/admin/courses/${mostEnrolledCourse.id}/edit`}>
                  <Button variant="outline" className="border-slate-200 hover:bg-slate-50">Edit Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
