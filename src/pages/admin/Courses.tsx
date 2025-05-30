
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  price: number;
  thumbnail: string;
  enrollment_count: number;
  category: string;
  duration: string;
  created_at: string;
}

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log('AdminCourses: Fetching courses...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('AdminCourses: Error fetching courses:', error);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log('AdminCourses: Courses fetched successfully:', data.length);
        setCourses(data);
      } else {
        console.log('AdminCourses: No courses found');
        setCourses([]);
      }
    } catch (error) {
      console.error('AdminCourses: Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('AdminCourses: Deleting course:', courseId);
      
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('AdminCourses: Error deleting course:', error);
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `"${courseTitle}" has been deleted successfully`,
      });
      
      fetchCourses();
    } catch (error) {
      console.error('AdminCourses: Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const averagePrice = courses.length > 0 
    ? (courses.reduce((sum, course) => sum + course.price, 0) / courses.length)
    : 0;

  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollment_count, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
              Manage Courses
            </h1>
            <p className="text-slate-600">Create, edit, and manage all courses</p>
          </div>
          <Link to="/admin/courses/new/edit">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-lg border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{courses.length}</div>
              <p className="text-xs text-slate-500">Active courses</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-lg border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Average Price</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ₹{averagePrice.toFixed(0)}
              </div>
              <p className="text-xs text-slate-500">Per course</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-lg border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalEnrollments}</div>
              <p className="text-xs text-slate-500">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-white/70 backdrop-blur-lg border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
                    }}
                  />
                  <CardTitle className="text-lg line-clamp-2 text-slate-900">{course.title}</CardTitle>
                  <CardDescription className="text-slate-600">
                    By {course.instructor} • {course.difficulty}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ₹{course.price}
                    </span>
                    <span className="text-sm text-slate-500">
                      {course.enrollment_count} students
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/admin/courses/${course.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-100 text-slate-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => deleteCourse(course.id, course.title)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-600 mb-2">No courses yet</h2>
            <p className="text-slate-500 text-lg mb-6">Create your first course to get started!</p>
            <Link to="/admin/courses/new/edit">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminCourses;
