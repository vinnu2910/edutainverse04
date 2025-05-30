
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
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

interface UserStats {
  totalUsers: number;
  avgEnrollments: number;
  avgProgress: number;
}

const AdminUserAnalytics: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    avgEnrollments: 0,
    avgProgress: 0
  });

  useEffect(() => {
    console.log('UserAnalytics: Starting data fetch');
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async (): Promise<void> => {
    try {
      console.log('UserAnalytics: Fetching user analytics data...');
      setError(null);
      
      // Fetch only student users (exclude admin users)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('UserAnalytics: Error fetching users:', usersError);
        setError('Failed to fetch user data');
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
          setError('Failed to fetch enrollment data');
          return;
        }

        // Process user data to calculate statistics
        const processedUsers: UserData[] = usersData.map(user => {
          const userEnrollments = enrollmentsData?.filter(e => e.user_id === user.id) || [];
          const enrolledCourses = userEnrollments.length;
          const completedCourses = userEnrollments.filter(e => (e.progress || 0) >= 100).length;
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
            joinDate: user.created_at || new Date().toISOString()
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

        const finalStats: UserStats = {
          totalUsers,
          avgEnrollments,
          avgProgress
        };

        console.log('UserAnalytics: Final stats:', finalStats);
        setStats(finalStats);
      }
    } catch (error) {
      console.error('UserAnalytics: Error fetching user analytics:', error);
      setError('An unexpected error occurred while fetching data');
    } finally {
      setLoading(false);
      console.log('UserAnalytics: Data fetch completed');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading user analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Error</div>
            <p className="text-slate-600">{error}</p>
            <button 
              onClick={fetchUserAnalytics}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
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
            User Analytics
          </h1>
          <p className="text-slate-600">Track student progress and engagement</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
              <p className="text-xs text-slate-500">Active learners</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Avg. Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.avgEnrollments}</div>
              <p className="text-xs text-slate-500">Courses per student</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Avg. Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.avgProgress}%</div>
              <p className="text-xs text-slate-500">Overall completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900">Student Overview</CardTitle>
            <CardDescription>Individual student progress and enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">No students found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-xs text-slate-500">
                          Joined: {new Date(user.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-900">{user.enrolledCourses}</p>
                        <p className="text-xs text-slate-600">Enrolled</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-900">{user.completedCourses}</p>
                        <p className="text-xs text-slate-600">Completed</p>
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-600">Progress</span>
                          <span className="text-xs text-slate-600">{user.totalProgress}%</span>
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
    </Layout>
  );
};

export default AdminUserAnalytics;
