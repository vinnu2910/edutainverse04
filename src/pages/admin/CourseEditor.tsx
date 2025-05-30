import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, ArrowLeft, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Video {
  id: string;
  title: string;
  youtube_id: string;
  duration: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  order_index: number;
}

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
  modules: Module[];
}

const AdminCourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course>({
    id: '',
    title: '',
    description: '',
    instructor: '',
    difficulty: 'Beginner',
    price: 0,
    duration: '',
    thumbnail: '',
    category: '',
    modules: []
  });

  const isNewCourse = id === 'new';

  useEffect(() => {
    if (!isNewCourse && id) {
      loadCourse();
    }
  }, [id, isNewCourse]);

  const loadCourse = async () => {
    if (!id || isNewCourse) return;

    try {
      setLoading(true);
      console.log('CourseEditor: Loading course:', id);
      
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) {
        console.error('CourseEditor: Error loading course:', courseError);
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive",
        });
        return;
      }

      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      if (modulesError) {
        console.error('CourseEditor: Error loading modules:', modulesError);
      }

      const moduleIds = modulesData?.map(m => m.id) || [];
      let videosData: any[] = [];
      
      if (moduleIds.length > 0) {
        const { data: videos, error: videosError } = await supabase
          .from('module_videos')
          .select('*')
          .in('module_id', moduleIds)
          .order('order_index');

        if (videosError) {
          console.error('CourseEditor: Error loading videos:', videosError);
        } else {
          videosData = videos || [];
        }
      }

      const modulesWithVideos = modulesData?.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order_index: module.order_index,
        videos: videosData.filter(video => video.module_id === module.id).map(video => ({
          id: video.id,
          title: video.title,
          youtube_id: video.youtube_url,
          duration: video.duration,
          order_index: video.order_index
        }))
      })) || [];

      if (courseData) {
        console.log('CourseEditor: Course loaded:', courseData);
        setCourse({
          ...courseData,
          modules: modulesWithVideos
        });
      }
    } catch (error) {
      console.error('CourseEditor: Error loading course:', error);
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      videos: [],
      order_index: course.modules.length
    };
    setCourse({
      ...course,
      modules: [...course.modules, newModule]
    });
  };

  const updateModule = (moduleId: string, field: string, value: string) => {
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId ? { ...module, [field]: value } : module
      )
    });
  };

  const deleteModule = (moduleId: string) => {
    setCourse({
      ...course,
      modules: course.modules.filter(module => module.id !== moduleId)
    });
  };

  const addVideo = (moduleId: string) => {
    const newVideo: Video = {
      id: `temp-${Date.now()}`,
      title: '',
      youtube_id: '',
      duration: '',
      order_index: 0
    };

    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              videos: [...module.videos, { ...newVideo, order_index: module.videos.length }]
            }
          : module
      )
    });
  };

  const updateVideo = (moduleId: string, videoId: string, field: string, value: string | number) => {
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              videos: module.videos.map(video =>
                video.id === videoId ? { ...video, [field]: value } : video
              )
            }
          : module
      )
    });
  };

  const deleteVideo = (moduleId: string, videoId: string) => {
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              videos: module.videos.filter(video => video.id !== videoId)
            }
          : module
      )
    });
  };

  const saveCourse = async () => {
    if (!course.title || !course.description || !course.instructor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('CourseEditor: Saving course...');

      const courseData = {
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        difficulty: course.difficulty,
        price: course.price,
        duration: course.duration,
        thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
        category: course.category,
        enrollment_count: 0
      };

      let courseId = course.id;

      if (isNewCourse) {
        const { data, error } = await supabase
          .from('courses')
          .insert([courseData])
          .select()
          .single();

        if (error) {
          console.error('CourseEditor: Error creating course:', error);
          toast({
            title: "Error",
            description: "Failed to create course",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          courseId = data.id;
          console.log('CourseEditor: Course created:', data);
        }
      } else {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', course.id);

        if (error) {
          console.error('CourseEditor: Error updating course:', error);
          toast({
            title: "Error",
            description: "Failed to update course",
            variant: "destructive",
          });
          return;
        }
      }

      for (const module of course.modules) {
        let moduleId = module.id;
        
        if (module.id.startsWith('temp-')) {
          const { data: moduleData, error: moduleError } = await supabase
            .from('course_modules')
            .insert([{
              course_id: courseId,
              title: module.title,
              description: module.description,
              order_index: module.order_index
            }])
            .select()
            .single();

          if (moduleError) {
            console.error('CourseEditor: Error creating module:', moduleError);
            continue;
          }
          
          moduleId = moduleData.id;
        } else {
          await supabase
            .from('course_modules')
            .update({
              title: module.title,
              description: module.description,
              order_index: module.order_index
            })
            .eq('id', module.id);
        }

        for (const video of module.videos) {
          if (video.id.startsWith('temp-')) {
            await supabase
              .from('module_videos')
              .insert([{
                module_id: moduleId,
                title: video.title,
                youtube_url: video.youtube_id,
                duration: video.duration,
                order_index: video.order_index
              }]);
          } else {
            await supabase
              .from('module_videos')
              .update({
                title: video.title,
                youtube_url: video.youtube_id,
                duration: video.duration,
                order_index: video.order_index
              })
              .eq('id', video.id);
          }
        }
      }

      toast({
        title: "Success",
        description: isNewCourse ? "Course created successfully" : "Course updated successfully",
      });

      if (isNewCourse) {
        navigate(`/admin/courses/${courseId}/edit`);
      }
    } catch (error) {
      console.error('CourseEditor: Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNewCourse) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-2 border-slate-300 hover:bg-slate-100 text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
              {isNewCourse ? 'Create New Course' : 'Edit Course'}
            </h1>
            <p className="text-slate-600">
              {isNewCourse ? 'Create and configure your new course' : 'Update course information and content'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100">
            <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Basic Information</TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Course Content</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card className="bg-white/70 backdrop-blur-lg border-slate-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Basic Course Information</CardTitle>
                <CardDescription className="text-slate-600">Enter the basic details of your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-slate-700">Course Title *</Label>
                    <Input
                      id="title"
                      value={course.title}
                      onChange={(e) => setCourse({ ...course, title: e.target.value })}
                      placeholder="Enter course title"
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor" className="text-slate-700">Instructor *</Label>
                    <Input
                      id="instructor"
                      value={course.instructor}
                      onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
                      placeholder="Instructor name"
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-700">Description *</Label>
                  <Textarea
                    id="description"
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    placeholder="Course description"
                    rows={4}
                    className="border-slate-300 focus:border-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty" className="text-slate-700">Difficulty</Label>
                    <Select value={course.difficulty} onValueChange={(value) => setCourse({ ...course, difficulty: value })}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Average">Average</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-slate-700">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={course.price}
                      onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                      placeholder="0"
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-slate-700">Duration</Label>
                    <Input
                      id="duration"
                      value={course.duration}
                      onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                      placeholder="e.g., 8 hours"
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-slate-700">Category</Label>
                    <Input
                      id="category"
                      value={course.category}
                      onChange={(e) => setCourse({ ...course, category: e.target.value })}
                      placeholder="Course category"
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail" className="text-slate-700">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      value={course.thumbnail}
                      onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="bg-white/70 backdrop-blur-lg border-slate-200/50 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-slate-900">Course Content</CardTitle>
                    <CardDescription className="text-slate-600">Add modules and videos to your course</CardDescription>
                  </div>
                  <Button onClick={addModule} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {course.modules.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No modules yet</h3>
                    <p className="text-slate-500 mb-4">
                      Start building your course by adding modules and videos.
                    </p>
                    <Button onClick={addModule} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Module
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {course.modules.map((module, moduleIndex) => (
                      <Card key={module.id} className="border-l-4 border-l-blue-500 bg-white/50">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-4">
                              <div>
                                <Label className="text-slate-700">Module Title</Label>
                                <Input
                                  value={module.title}
                                  onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                                  placeholder="Enter module title"
                                  className="border-slate-300 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <Label className="text-slate-700">Module Description</Label>
                                <Textarea
                                  value={module.description}
                                  onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                                  placeholder="Enter module description"
                                  rows={2}
                                  className="border-slate-300 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteModule(module.id)}
                              className="ml-4 border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-slate-700">Videos</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addVideo(module.id)}
                              className="border-slate-300 hover:bg-slate-100 text-slate-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Video
                            </Button>
                          </div>
                          
                          {module.videos.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                              <Video className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                              <p className="text-slate-500">No videos in this module</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {module.videos.map((video, videoIndex) => (
                                <div key={video.id} className="flex gap-4 p-4 border border-slate-200 rounded-lg bg-white/50">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <Label className="text-slate-700">Video Title</Label>
                                      <Input
                                        value={video.title}
                                        onChange={(e) => updateVideo(module.id, video.id, 'title', e.target.value)}
                                        placeholder="Enter video title"
                                        className="border-slate-300 focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-slate-700">YouTube ID</Label>
                                      <Input
                                        value={video.youtube_id}
                                        onChange={(e) => updateVideo(module.id, video.id, 'youtube_id', e.target.value)}
                                        placeholder="YouTube video ID"
                                        className="border-slate-300 focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-slate-700">Duration</Label>
                                      <Input
                                        value={video.duration}
                                        onChange={(e) => updateVideo(module.id, video.id, 'duration', e.target.value)}
                                        placeholder="e.g., 10:30"
                                        className="border-slate-300 focus:border-blue-500"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteVideo(module.id, video.id)}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/courses')} className="border-slate-300 hover:bg-slate-100 text-slate-700">
            Cancel
          </Button>
          <Button onClick={saveCourse} disabled={loading} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : isNewCourse ? 'Create Course' : 'Update Course'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCourseEditor;
