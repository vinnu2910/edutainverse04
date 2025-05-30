
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching admin dashboard data...');
      
      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
      }

      // Fetch total courses
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      if (coursesError) {
        console.error('Error fetching courses count:', coursesError);
      }

      // Fetch total enrollments
      const { count: enrollmentsCount, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      if (enrollmentsError) {
        console.error('Error fetching enrollments count:', enrollmentsError);
      }

      // Calculate completion rate (enrollments with 100% progress)
      const { count: completedCount, error: completedError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .gte('progress', 100);

      if (completedError) {
        console.error('Error fetching completed enrollments:', completedError);
      }

      // Fetch most enrolled course
      const { data: mostEnrolled, error: mostEnrolledError } = await supabase
        .from('courses')
        .select('*')
        .order('enrollment_count', { ascending: false })
        .limit(1)
        .single();

      if (mostEnrolledError && mostEnrolledError.code !== 'PGRST116') {
        console.error('Error fetching most enrolled course:', mostEnrolledError);
      } else if (mostEnrolled) {
        setMostEnrolledCourse(mostEnrolled);
      }

      // Calculate completion rate percentage
      const completionRate = enrollmentsCount && completedCount 
        ? Math.round((completedCount / enrollmentsCount) * 100)
        : 0;

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        totalEnrollments: enrollmentsCount || 0,
        completionRate
      });

      console.log('Dashboard data fetched successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's your platform overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Course enrollments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">Average completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/courses">
            <Button className="w-full h-20 flex flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              Manage Courses
            </Button>
          </Link>
          <Link to="/admin/analytics/users">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              User Analytics
            </Button>
          </Link>
          <Link to="/admin/analytics/courses">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              Course Analytics
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
            <TrendingUp className="w-6 h-6" />
            Reports
          </Button>
        </div>

        {/* Most Popular Course */}
        {mostEnrolledCourse && (
          <Card>
            <CardHeader>
              <CardTitle>Most Enrolled Course</CardTitle>
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
                  <h3 className="font-semibold">{mostEnrolledCourse.title}</h3>
                  <p className="text-sm text-gray-600">By {mostEnrolledCourse.instructor}</p>
                  <p className="text-sm text-gray-500">{mostEnrolledCourse.enrollment_count} students enrolled</p>
                </div>
                <Link to={`/admin/courses/${mostEnrolledCourse.id}/edit`}>
                  <Button variant="outline">Edit Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
