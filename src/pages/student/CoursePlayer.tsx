
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Play, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
      fetchUserProgress();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    if (!courseId) return;

    try {
      console.log('Fetching course data for player:', courseId);
      
      // Fetch course details
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

      // Fetch modules with videos
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          module_videos (*)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
        return;
      }

      if (modulesData) {
        // Sort videos within each module
        const sortedModules = modulesData.map(module => ({
          ...module,
          module_videos: module.module_videos?.sort((a, b) => a.order_index - b.order_index) || []
        }));
        
        setModules(sortedModules);
        
        // Set first video as current
        if (sortedModules.length > 0 && sortedModules[0].module_videos?.length > 0) {
          setCurrentVideo(sortedModules[0].module_videos[0]);
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
        setCompletedVideos(data.map(item => item.video_id));
        console.log('User progress fetched:', data.length, 'completed videos');
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
        // Mark as incomplete
        const { error } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);

        if (error) {
          console.error('Error marking video as incomplete:', error);
          return;
        }

        setCompletedVideos(completedVideos.filter(id => id !== videoId));
        toast({
          title: "Video marked as incomplete",
          description: "You can re-watch this video anytime",
        });
      } else {
        // Mark as complete
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

        setCompletedVideos([...completedVideos, videoId]);
        toast({
          title: "Video completed!",
          description: "Great job! Keep up the learning momentum.",
        });

        // Update enrollment progress
        await updateEnrollmentProgress();
      }
    } catch (error) {
      console.error('Error toggling video completion:', error);
    }
  };

  const updateEnrollmentProgress = async () => {
    if (!courseId || !user) return;

    try {
      // Calculate total videos and completed videos
      const totalVideos = modules.reduce((acc, module) => acc + (module.module_videos?.length || 0), 0);
      const completedCount = completedVideos.length + 1; // +1 for the video just completed
      const progressPercentage = Math.round((completedCount / totalVideos) * 100);

      // Update enrollment progress
      const { error } = await supabase
        .from('enrollments')
        .update({ progress: progressPercentage })
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) {
        console.error('Error updating enrollment progress:', error);
      } else {
        console.log('Enrollment progress updated to:', progressPercentage);
      }
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
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
  const completedCount = completedVideos.length;
  const progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/student/mylearning">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Learning
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-gray-600">Progress: {progressPercentage}% ({completedCount}/{totalVideos} videos)</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {currentVideo?.title || 'Select a video to start'}
                  {currentVideo && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`video-${currentVideo.id}`}
                        checked={completedVideos.includes(currentVideo.id)}
                        onCheckedChange={() => toggleVideoCompletion(currentVideo.id)}
                      />
                      <label htmlFor={`video-${currentVideo.id}`} className="text-sm">
                        Mark as completed
                      </label>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentVideo ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${currentVideo.youtube_url}`}
                      title={currentVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Select a video to start learning</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Content */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <h3 className="font-medium text-sm border-b pb-2">{module.title}</h3>
                    {module.module_videos?.map((video) => {
                      const isCompleted = completedVideos.includes(video.id);
                      const isCurrent = currentVideo?.id === video.id;
                      
                      return (
                        <div
                          key={video.id}
                          className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                            isCurrent ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setCurrentVideo(video)}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm ${isCurrent ? 'font-medium text-blue-700' : ''}`}>
                              {video.title}
                            </p>
                            <p className="text-xs text-gray-500">{video.duration}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCoursePlayer;
