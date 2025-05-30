import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpen, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  completedCourses: number;
  totalProgress: number;
  joinDate: string;
}

const AdminUserAnalytics = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    avgEnrollments: 0,
    avgProgress: 0
  });

  useEffect(() => {
    console.log('UserAnalytics: Starting data fetch');
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      console.log('UserAnalytics: Fetching user analytics data...');
      
      // Fetch only student users (exclude admin users)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('UserAnalytics: Error fetching users:', usersError);
        return;
      }

      if (usersData) {
        console.log('UserAnalytics: Raw student users data fetched:', usersData.length, 'students');
        
        // Fetch enrollments separately to avoid relationship ambiguity
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('user_id, progress, course_id');

        if (enrollmentsError) {
          console.error('UserAnalytics: Error fetching enrollments:', enrollmentsError);
        }

        // Process user data to calculate statistics
        const processedUsers: UserData[] = usersData.map(user => {
          const userEnrollments = enrollmentsData?.filter(e => e.user_id === user.id) || [];
          const enrolledCourses = userEnrollments.length;
          const completedCourses = userEnrollments.filter(e => e.progress >= 100).length;
          const totalProgress = userEnrollments.length > 0 
            ? Math.round(userEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / userEnrollments.length)
            : 0;

          return {
            id: user.id,
            name: user.name || 'Unknown User',
            email: user.email || 'No email',
            enrolledCourses,
            completedCourses,
            totalProgress,
            joinDate: user.created_at
          };
        });

        console.log('UserAnalytics: Processed student users data:', processedUsers);
        setUsers(processedUsers);

        // Calculate overall statistics
        const totalUsers = processedUsers.length;
        const avgEnrollments = totalUsers > 0 
          ? Math.round(processedUsers.reduce((sum, user) => sum + user.enrolledCourses, 0) / totalUsers * 10) / 10
          : 0;
        const avgProgress = totalUsers > 0
          ? Math.round(processedUsers.reduce((sum, user) => sum + user.totalProgress, 0) / totalUsers)
          : 0;

        const finalStats = {
          totalUsers,
          avgEnrollments,
          avgProgress
        };

        console.log('UserAnalytics: Final stats:', finalStats);
        setStats(finalStats);
      }
    } catch (error) {
      console.error('UserAnalytics: Error fetching user analytics:', error);
    } finally {
      setLoading(false);
      console.log('UserAnalytics: Data fetch completed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user analytics...</p>
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
          <h1 className="text-4xl font-bold mb-2">User Analytics</h1>
          <p className="text-gray-600">Track student progress and engagement</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active learners</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgEnrollments}</div>
              <p className="text-xs text-muted-foreground">Courses per student</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
              <p className="text-xs text-muted-foreground">Overall completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Student Overview</CardTitle>
            <CardDescription>Individual student progress and enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No students found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Joined: {new Date(user.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-sm font-medium">{user.enrolledCourses}</p>
                        <p className="text-xs text-gray-600">Enrolled</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{user.completedCourses}</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs text-gray-600">{user.totalProgress}%</span>
                        </div>
                        <Progress value={user.totalProgress} className="w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserAnalytics;
