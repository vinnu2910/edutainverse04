
import React from 'react';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { mockCourses } from '../../data/mockData';
import { Users, BookOpen, TrendingUp } from 'lucide-react';

const AdminUserAnalytics = () => {
  // Mock user data
  const users = [
    {
      id: '1',
      name: 'Danush',
      email: 'danush@example.com',
      enrolledCourses: 3,
      completedCourses: 1,
      totalProgress: 65,
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Rajesh',
      email: 'Rajesh@example.com',
      enrolledCourses: 2,
      completedCourses: 2,
      totalProgress: 100,
      joinDate: '2024-02-20'
    },
    {
      id: '3',
      name: 'mohan',
      email: 'mohan@example.com',
      enrolledCourses: 1,
      completedCourses: 0,
      totalProgress: 25,
      joinDate: '2024-03-10'
    }
  ];

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
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Active learners</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.0</div>
              <p className="text-xs text-muted-foreground">Courses per student</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">63%</div>
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
            <div className="space-y-6">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserAnalytics;
