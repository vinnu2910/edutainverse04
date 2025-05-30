
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Video {
  id: string;
  title: string;
  youtubeId: string;
  duration: string;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  order: number;
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

      if (courseData) {
        console.log('CourseEditor: Course loaded:', courseData);
        setCourse({
          ...courseData,
          modules: [] // For now, we'll work with basic course data
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
      id: Date.now().toString(),
      title: '',
      description: '',
      videos: [],
      order: course.modules.length
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
      id: Date.now().toString(),
      title: '',
      youtubeId: '',
      duration: '',
      order: 0
    };

    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              videos: [...module.videos, { ...newVideo, order: module.videos.length }]
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
          console.log('CourseEditor: Course created:', data);
          toast({
            title: "Course created",
            description: "Course has been created successfully",
          });
          navigate(`/admin/courses/${data.id}/edit`);
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

        console.log('CourseEditor: Course updated successfully');
        toast({
          title: "Course updated",
          description: "Course has been updated successfully",
        });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {isNewCourse ? 'Create New Course' : 'Edit Course'}
            </h1>
            <p className="text-gray-600">
              {isNewCourse ? 'Create and configure your new course' : 'Update course information and content'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="content">Course Content</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Course Information</CardTitle>
                <CardDescription>Enter the basic details of your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={course.title}
                      onChange={(e) => setCourse({ ...course, title: e.target.value })}
                      placeholder="Enter course title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">Instructor *</Label>
                    <Input
                      id="instructor"
                      value={course.instructor}
                      onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
                      placeholder="Instructor name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    placeholder="Course description"
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={course.difficulty} onValueChange={(value) => setCourse({ ...course, difficulty: value })}>
                      <SelectTrigger>
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
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={course.price}
                      onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={course.duration}
                      onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                      placeholder="e.g., 8 hours"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={course.category}
                      onChange={(e) => setCourse({ ...course, category: e.target.value })}
                      placeholder="Course category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      value={course.thumbnail}
                      onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>Add modules and videos to your course (coming soon)</CardDescription>
                  </div>
                  <Button onClick={addModule} disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Course Content Management</h3>
                  <p className="text-gray-500 mb-4">
                    Advanced content management with modules and videos is coming soon. 
                    For now, focus on creating the basic course information.
                  </p>
                  <p className="text-sm text-gray-400">
                    This feature will allow you to add structured modules with video lessons, 
                    quizzes, and other learning materials.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/courses')}>
            Cancel
          </Button>
          <Button onClick={saveCourse} disabled={loading} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : isNewCourse ? 'Create Course' : 'Update Course'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseEditor;
