import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Clock, BookOpen, Play, Heart } from 'lucide-react';
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
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user) {
        checkEnrollment();
        checkWishlist();
      }
    }
  }, [id, user]);

  const fetchCourse = async () => {
    if (!id) return;

    try {
      console.log('CourseDetail: Fetching course details for:', id);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) {
        console.error('CourseDetail: Error fetching course:', courseError);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        });
        return;
      }

      if (courseData) {
        console.log('CourseDetail: Course data fetched:', courseData);
        setCourse(courseData);

        // Try to fetch modules with improved error handling
        try {
          const { data: modulesData, error: modulesError } = await supabase
            .from('course_modules')
            .select(`
              *,
              module_videos!fk_module_videos_module_id (*)
            `)
            .eq('course_id', id)
            .order('order_index');

          if (modulesError) {
            console.log('CourseDetail: Trying alternative relationship:', modulesError);
            // Try alternative relationship
            const { data: altModulesData, error: altModulesError } = await supabase
              .from('course_modules')
              .select(`
                *,
                module_videos!module_videos_module_id_fkey (*)
              `)
              .eq('course_id', id)
              .order('order_index');

            if (altModulesError) {
              console.log('CourseDetail: Trying simple fetch:', altModulesError);
              // Fetch modules and videos separately
              const { data: simpleModulesData, error: simpleModulesError } = await supabase
                .from('course_modules')
                .select('*')
                .eq('course_id', id)
                .order('order_index');

              if (simpleModulesError) {
                console.log('CourseDetail: All module queries failed:', simpleModulesError);
                setModules([]);
              } else if (simpleModulesData) {
                // Fetch videos separately for each module
                const modulesWithVideos = await Promise.all(
                  simpleModulesData.map(async (module) => {
                    const { data: videos, error: videosError } = await supabase
                      .from('module_videos')
                      .select('*')
                      .eq('module_id', module.id)
                      .order('order_index');

                    if (videosError) {
                      console.error('Error fetching videos for module:', module.id, videosError);
                      return { ...module, module_videos: [] };
                    }

                    return { ...module, module_videos: videos || [] };
                  })
                );

                console.log('CourseDetail: Modules with videos fetched:', modulesWithVideos);
                setModules(modulesWithVideos);
              }
            } else if (altModulesData) {
              console.log('CourseDetail: Alternative modules fetched:', altModulesData);
              setModules(altModulesData);
            }
          } else if (modulesData) {
            console.log('CourseDetail: Modules fetched:', modulesData);
            setModules(modulesData);
          }
        } catch (moduleError) {
          console.log('CourseDetail: Modules not available:', moduleError);
          setModules([]);
        }
      }
    } catch (error) {
      console.error('CourseDetail: Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
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
        console.error('CourseDetail: Error checking enrollment:', error);
        return;
      }

      setIsEnrolled(!!data);
      console.log('CourseDetail: Enrollment status:', !!data);
    } catch (error) {
      console.error('CourseDetail: Error checking enrollment:', error);
    }
  };

  const checkWishlist = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('CourseDetail: Error checking wishlist:', error);
        return;
      }

      setIsInWishlist(!!data);
      console.log('CourseDetail: Wishlist status:', !!data);
    } catch (error) {
      console.error('CourseDetail: Error checking wishlist:', error);
    }
  };

  const handleEnroll = async () => {
    if (!id || !user) return;

    try {
      console.log('CourseDetail: Enrolling in course:', id);
      const { error } = await supabase
        .from('enrollments')
        .insert([{
          user_id: user.id,
          course_id: id,
          progress: 0
        }]);

      if (error) {
        console.error('CourseDetail: Error enrolling in course:', error);
        toast({
          title: "Error",
          description: "Failed to enroll in course",
          variant: "destructive",
        });
        return;
      }

      setIsEnrolled(true);
      
      // Remove from wishlist if enrolled
      if (isInWishlist) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', id);
        setIsInWishlist(false);
      }

      toast({
        title: "Enrolled successfully!",
        description: `You are now enrolled in ${course?.title}`,
      });
    } catch (error) {
      console.error('CourseDetail: Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  const handleWishlist = async () => {
    if (!id || !user) return;

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', id);

        if (error) {
          console.error('CourseDetail: Error removing from wishlist:', error);
          return;
        }

        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: `${course?.title} removed from your wishlist`,
        });
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert([{
            user_id: user.id,
            course_id: id
          }]);

        if (error) {
          console.error('CourseDetail: Error adding to wishlist:', error);
          return;
        }

        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: `${course?.title} added to your wishlist`,
        });
      }
    } catch (error) {
      console.error('CourseDetail: Error updating wishlist:', error);
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
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Course not found</h2>
            <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Link to="/student/courses">
              <Button>Browse All Courses</Button>
            </Link>
          </div>
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
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
                  }}
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
                  {totalVideos > 0 && (
                    <div className="flex items-center">
                      <Play className="w-4 h-4 mr-2" />
                      {totalVideos} videos
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600">Instructor: <span className="font-medium">{course.instructor}</span></p>
              </CardHeader>
            </Card>

            {/* Course Modules */}
            {modules.length > 0 && (
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
            )}
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
                    {user && (
                      <Button 
                        onClick={handleWishlist} 
                        variant="outline" 
                        className="w-full"
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
                        {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      </Button>
                    )}
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
