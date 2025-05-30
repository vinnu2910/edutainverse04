
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Clock, BookOpen, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  module_videos: Video[];
}

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  duration: string;
  order_index: number;
}

const StudentCourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchCourse();
      checkEnrollment();
    }
  }, [id, user]);

  const fetchCourse = async () => {
    if (!id) return;

    try {
      console.log('Fetching course details for:', id);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError || !courseData) {
        console.error('Error fetching course:', courseError);
        return;
      }

      setCourse(courseData);

      // Fetch modules with videos
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          module_videos (*)
        `)
        .eq('course_id', id)
        .order('order_index');

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
        return;
      }

      if (modulesData) {
        setModules(modulesData);
        console.log('Course details fetched successfully');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking enrollment:', error);
        return;
      }

      setIsEnrolled(!!data);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!id || !user) return;

    try {
      console.log('Enrolling in course:', id);
      const { error } = await supabase
        .from('enrollments')
        .insert([{
          user_id: user.id,
          course_id: id,
          progress: 0
        }]);

      if (error) {
        console.error('Error enrolling in course:', error);
        toast({
          title: "Error",
          description: "Failed to enroll in course",
          variant: "destructive",
        });
        return;
      }

      setIsEnrolled(true);
      toast({
        title: "Enrolled successfully!",
        description: `You are now enrolled in ${course?.title}`,
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Course not found.</p>
        </div>
      </div>
    );
  }

  const totalVideos = modules.reduce((acc, module) => acc + (module.module_videos?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <div className="flex justify-between items-start mb-4">
                  <CardTitle className="text-3xl">{course.title}</CardTitle>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.difficulty === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.difficulty}
                  </span>
                </div>
                <CardDescription className="text-lg mb-6">{course.description}</CardDescription>
                
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {course.enrollment_count} students
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {modules.length} modules
                  </div>
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-2" />
                    {totalVideos} videos
                  </div>
                </div>
                
                <p className="text-gray-600">Instructor: <span className="font-medium">{course.instructor}</span></p>
              </CardHeader>
            </Card>

            {/* Course Modules */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {modules.length} modules • {totalVideos} videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {modules.map((module, index) => (
                    <AccordionItem key={module.id} value={`module-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <p className="text-sm text-gray-500">{module.module_videos?.length || 0} videos</p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {module.module_videos?.map((video) => (
                            <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <Play className="w-4 h-4 mr-3 text-gray-400" />
                                <span className="text-sm">{video.title}</span>
                              </div>
                              <span className="text-xs text-gray-500">{video.duration}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Course Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  ₹{course.price}
                </div>
                {isEnrolled ? (
                  <div className="space-y-4">
                    <p className="text-green-600 font-medium">✓ You're enrolled in this course</p>
                    <Link to={`/student/learn/${course.id}`}>
                      <Button className="w-full">Continue Learning</Button>
                    </Link>
                    <Link to="/student/mylearning">
                      <Button variant="outline" className="w-full">Go to My Learning</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={handleEnroll} className="w-full">
                      Enroll Now
                    </Button>
                    <p className="text-sm text-gray-600 text-center">
                      Get lifetime access to this course
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseDetail;
