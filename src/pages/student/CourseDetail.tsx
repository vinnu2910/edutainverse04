import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Clock, BookOpen, Play, Heart, Star, GraduationCap } from 'lucide-react';
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
              const { data: simpleModulesData, error: simpleModulesError } = await supabase
                .from('course_modules')
                .select('*')
                .eq('course_id', id)
                .order('order_index');

              if (simpleModulesError) {
                console.log('CourseDetail: All module queries failed:', simpleModulesError);
                setModules([]);
              } else if (simpleModulesData) {
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
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
            <p className="text-slate-600 font-medium">Loading course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Course not found</h2>
            <p className="text-lg text-slate-600 mb-8">The course you're looking for doesn't exist or has been removed.</p>
            <Link to="/student/courses">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-xl">
                Browse All Courses
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const totalVideos = modules.reduce((acc, module) => acc + (module.module_videos?.length || 0), 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Course Info */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-6 right-6">
                  <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-lg ${
                    course.difficulty === 'Beginner' ? 'bg-green-500/90 text-white' :
                    course.difficulty === 'Average' ? 'bg-yellow-500/90 text-white' :
                    'bg-red-500/90 text-white'
                  }`}>
                    {course.difficulty}
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {course.title}
                  </h1>
                  <p className="text-white/90 text-lg drop-shadow-md">
                    By {course.instructor}
                  </p>
                </div>
              </div>
              
              <CardContent className="p-8">
                <CardDescription className="text-lg text-slate-700 mb-8 leading-relaxed">
                  {course.description}
                </CardDescription>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-slate-600">Students</div>
                    <div className="font-bold text-slate-800">{course.enrollment_count}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm text-slate-600">Duration</div>
                    <div className="font-bold text-slate-800">{course.duration}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-slate-600">Modules</div>
                    <div className="font-bold text-slate-800">{modules.length}</div>
                  </div>
                  {totalVideos > 0 && (
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <Play className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm text-slate-600">Videos</div>
                      <div className="font-bold text-slate-800">{totalVideos}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Modules */}
            {modules.length > 0 && (
              <Card className="mt-8 border-0 shadow-xl bg-white/90 backdrop-blur-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50">
                  <CardTitle className="text-2xl text-slate-800 flex items-center space-x-3">
                    <GraduationCap className="w-7 h-7 text-blue-600" />
                    <span>Course Content</span>
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {modules.length} modules • {totalVideos} videos
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {modules.map((module, index) => (
                      <AccordionItem key={module.id} value={`module-${index}`} className="border border-slate-200 rounded-lg overflow-hidden">
                        <AccordionTrigger className="text-left px-6 py-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">{module.title}</h3>
                              <p className="text-sm text-slate-600">{module.module_videos?.length || 0} videos</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <div className="space-y-3 mt-4">
                            {module.module_videos?.map((video) => (
                              <div key={video.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center space-x-3">
                                  <Play className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm font-medium text-slate-700">{video.title}</span>
                                </div>
                                <span className="text-xs text-slate-500 font-medium">{video.duration}</span>
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
            <div className="sticky top-8">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardTitle className="text-2xl text-slate-800 flex items-center space-x-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <span>Course Price</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
                    ₹{course.price}
                  </div>
                  {isEnrolled ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-green-700 font-semibold flex items-center">
                          <GraduationCap className="w-5 h-5 mr-2" />
                          You're enrolled in this course
                        </p>
                      </div>
                      <Link to={`/student/learn/${course.id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                          Continue Learning
                        </Button>
                      </Link>
                      <Link to="/student/mylearning">
                        <Button variant="outline" className="w-full border-slate-300 hover:border-blue-500 hover:bg-blue-50 py-3 transition-all duration-300">
                          Go to My Learning
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button onClick={handleEnroll} className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                        Enroll Now
                      </Button>
                      {user && (
                        <Button 
                          onClick={handleWishlist} 
                          variant="outline" 
                          className="w-full border-slate-300 hover:border-red-400 hover:bg-red-50 py-3 transition-all duration-300"
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-current text-red-500' : 'text-slate-600'}`} />
                          {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </Button>
                      )}
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-700 text-center font-medium">
                          Get lifetime access to this course
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentCourseDetail;
