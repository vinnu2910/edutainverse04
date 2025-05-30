
import React from 'react';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockCourses } from '../../data/mockData';
import { Users, TrendingUp, Clock, Award } from 'lucide-react';

const AdminCourseAnalytics = () => {
  // Mock analytics data for courses
  const courseAnalytics = mockCourses.map(course => ({
    ...course,
    completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
    averageProgress: Math.floor(Math.random() * 30) + 70, // 70-100%
    dropOffPoint: Math.floor(Math.random() * 50) + 25, // 25-75%
    totalWatchTime: `${Math.floor(Math.random() * 8) + 2}h ${Math.floor(Math.random() * 60)}m`
  }));

  const totalEnrollments = courseAnalytics.reduce((sum, course) => sum + course.enrollmentCount, 0);
  const averageCompletion = Math.round(courseAnalytics.reduce((sum, course) => sum + course.completionRate, 0) / courseAnalytics.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Course Analytics</h1>
          <p className="text-gray-600">Analyze course performance and student engagement</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageCompletion}%</div>
              <p className="text-xs text-muted-foreground">Course completion rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseAnalytics.length}</div>
              <p className="text-xs text-muted-foreground">Published courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Detailed analytics for each course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {courseAnalytics.map((course) => (
                <div key={course.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-gray-600">By {course.instructor}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          course.category === 'Beginner' ? 'bg-green-100 text-green-800' :
                          course.category === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Enrollments</p>
                      <p className="text-2xl font-bold">{course.enrollmentCount}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
                      <p className="text-2xl font-bold">{course.completionRate}%</p>
                      <Progress value={course.completionRate} className="w-full mt-2" />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Avg. Progress</p>
                      <p className="text-2xl font-bold">{course.averageProgress}%</p>
                      <Progress value={course.averageProgress} className="w-full mt-2" />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Watch Time</p>
                      <p className="text-2xl font-bold">{course.totalWatchTime}</p>
                      <p className="text-xs text-gray-500 mt-1">Total duration</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Drop-off Point:</strong> {course.dropOffPoint}% of students tend to drop off around the middle of the course.
                    </p>
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

export default AdminCourseAnalytics;
