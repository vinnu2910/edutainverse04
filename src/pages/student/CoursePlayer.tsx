import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Play, CheckCircle, PlayCircle } from 'lucide-react';
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

const StudentCoursePlayer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
      fetchUserProgress();
    }
  }, [courseId, user]);

  useEffect(() => {
    const totalVideos = modules.reduce((acc, module) => acc + (module.module_videos?.length || 0), 0);
    const completedCount = completedVideos.length;
    const progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
    
    console.log('Progress calculation:', {
      totalVideos,
      completedCount,
      progressPercentage,
      currentProgress
    });

    if (progressPercentage !== currentProgress) {
      setCurrentProgress(progressPercentage);
      updateEnrollmentProgress(progressPercentage, completedVideos);
    }
  }, [completedVideos, modules]);

  const fetchCourseData = async () => {
    if (!courseId) return;

    try {
      console.log('Fetching course data for player:', courseId);
      
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError || !courseData) {
        console.error('Error fetching course:', courseError);
        return;
      }

      setCourse(courseData);

      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
        return;
      }

      if (modulesData) {
        const modulesWithVideos = await Promise.all(
          modulesData.map(async (module) => {
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

        setModules(modulesWithVideos);
        
        if (modulesWithVideos.length > 0 && modulesWithVideos[0].module_videos?.length > 0) {
          setCurrentVideo(modulesWithVideos[0].module_videos[0]);
        }
        
        console.log('Course data fetched successfully');
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!courseId || !user) return;

    try {
      console.log('Fetching user progress for course:', courseId);
      const { data, error } = await supabase
        .from('user_progress')
        .select('video_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) {
        console.error('Error fetching user progress:', error);
        return;
      }

      if (data) {
        const completedVideoIds = data.map(item => item.video_id);
        setCompletedVideos(completedVideoIds);
        console.log('User progress fetched:', completedVideoIds.length, 'completed videos');
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const toggleVideoCompletion = async (videoId: string) => {
    if (!user) return;

    const isCompleted = completedVideos.includes(videoId);

    try {
      if (isCompleted) {
        const { error } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);

        if (error) {
          console.error('Error marking video as incomplete:', error);
          return;
        }

        const newCompletedVideos = completedVideos.filter(id => id !== videoId);
        setCompletedVideos(newCompletedVideos);
        
        toast({
          title: "Video marked as incomplete",
          description: "You can re-watch this video anytime",
        });
      } else {
        const { error } = await supabase
          .from('user_progress')
          .upsert([{
            user_id: user.id,
            video_id: videoId,
            completed: true,
            completed_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Error marking video as complete:', error);
          return;
        }

        const newCompletedVideos = [...completedVideos, videoId];
        setCompletedVideos(newCompletedVideos);

        toast({
          title: "Video completed!",
          description: "Great job! Keep up the learning momentum.",
        });
      }
    } catch (error) {
      console.error('Error toggling video completion:', error);
    }
  };

  const updateEnrollmentProgress = async (progressPercentage: number, completedVideosList: string[]) => {
    if (!courseId || !user) return;

    try {
      console.log('Updating enrollment progress to:', progressPercentage);

      const { error } = await supabase
        .from('enrollments')
        .update({ progress: progressPercentage })
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) {
        console.error('Error updating enrollment progress:', error);
      } else {
        console.log('Enrollment progress updated successfully to:', progressPercentage);
      }
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
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
          <p className="text-center text-slate-500">Course not found.</p>
        </div>
      </Layout>
    );
  }

  const totalVideos = modules.reduce((acc, module) => acc + (module.module_videos?.length || 0), 0);
  const completedCount = completedVideos.length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/student/mylearning">
              <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Learning
              </Button>
            </Link>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                {course.title}
              </h1>
              <p className="text-slate-600">
                Progress: <span className="font-semibold text-blue-600">{currentProgress}%</span> 
                <span className="text-slate-400 mx-2">•</span>
                {completedCount}/{totalVideos} videos completed
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50">
                <CardTitle className="flex items-center justify-between text-slate-800">
                  <div className="flex items-center space-x-3">
                    <PlayCircle className="w-6 h-6 text-blue-600" />
                    <span>{currentVideo?.title || 'Select a video to start'}</span>
                  </div>
                  {currentVideo && (
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`video-${currentVideo.id}`}
                        checked={completedVideos.includes(currentVideo.id)}
                        onCheckedChange={() => toggleVideoCompletion(currentVideo.id)}
                        className="border-blue-300"
                      />
                      <label htmlFor={`video-${currentVideo.id}`} className="text-sm font-medium text-slate-700 cursor-pointer">
                        Mark as completed
                      </label>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {currentVideo ? (
                  <div className="aspect-video bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${currentVideo.youtube_url}`}
                      title={currentVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <PlayCircle className="w-16 h-16 text-slate-400 mx-auto" />
                      <p className="text-slate-600 font-medium">Select a video to start learning</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Content */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50">
                <CardTitle className="text-slate-800 flex items-center space-x-2">
                  <PlayCircle className="w-5 h-5 text-purple-600" />
                  <span>Course Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {modules.length > 0 ? (
                  <div className="space-y-6">
                    {modules.map((module) => (
                      <div key={module.id} className="space-y-3">
                        <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">
                          {module.title}
                        </h3>
                        <div className="space-y-2">
                          {module.module_videos?.map((video) => {
                            const isCompleted = completedVideos.includes(video.id);
                            const isCurrent = currentVideo?.id === video.id;
                            
                            return (
                              <div
                                key={video.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                                  isCurrent 
                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md' 
                                    : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                }`}
                                onClick={() => setCurrentVideo(video)}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Play className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isCurrent ? 'text-blue-700' : 'text-slate-700'
                                  }`}>
                                    {video.title}
                                  </p>
                                  <p className="text-xs text-slate-500">{video.duration}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PlayCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No course content available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentCoursePlayer;
