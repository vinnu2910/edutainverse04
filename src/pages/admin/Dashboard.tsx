import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCourses } from '../../data/mockData';
import { Users, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // adjust path if needed

const AdminDashboard = () => {
  const { user } = useAuth();

  // Mock stats
  const totalUsers = 2847;
  const totalCourses = mockCourses.length;

  // State for most enrolled course
  const [mostEnrolledCourse, setMostEnrolledCourse] = useState<any>(null);

  useEffect(() => {
    const fetchMostEnrolledCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('enrollment_count', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) setMostEnrolledCourse(data);
    };
    fetchMostEnrolledCourse();
  }, []);

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
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-xs text-muted-foreground">Active courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4,821</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">73%</div>
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
              <CardDescription>Your most popular course this month</CardDescription>
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
