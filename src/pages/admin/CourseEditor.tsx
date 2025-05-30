
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Video {
  id: string;
  title: string;
  youtubeId: string;
  duration: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: 'Beginner' | 'Average' | 'Advanced';
  price: number;
  duration: string;
  thumbnail: string;
  category: string;
  enrollment_count: number;
}

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Average' | 'Advanced'>('Beginner');
  const [instructor, setInstructor] = useState('');
  const [price, setPrice] = useState('0');
  const [duration, setDuration] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState('');
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    if (!isNew && id) {
      fetchCourse(id);
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  const fetchCourse = async (courseId: string) => {
    try {
      console.log('Fetching course:', courseId);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError || !courseData) {
        console.error('Error fetching course:', courseError);
        toast({
          title: "Error",
          description: "Course not found",
          variant: "destructive",
        });
        navigate('/admin/courses');
        return;
      }

      // Set course data
      setTitle(courseData.title);
      setDescription(courseData.description || '');
      setDifficulty(courseData.difficulty as 'Beginner' | 'Average' | 'Advanced');
      setInstructor(courseData.instructor);
      setPrice(courseData.price.toString());
      setDuration(courseData.duration || '');
      setThumbnail(courseData.thumbnail || '');
      setCategory(courseData.category || '');

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
        const formattedModules = modulesData.map(module => ({
          id: module.id,
          title: module.title,
          description: module.description || '',
          videos: (module.module_videos || []).map((video: any) => ({
            id: video.id,
            title: video.title,
            youtubeId: video.youtube_url,
            duration: video.duration
          }))
        }));
        setModules(formattedModules);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: '',
      description: '',
      videos: []
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const updateModule = (moduleId: string, field: keyof Module, value: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, [field]: value } : m
    ));
  };

  const addVideo = (moduleId: string) => {
    const newVideo: Video = {
      id: Date.now().toString(),
      title: '',
      youtubeId: '',
      duration: '0:00'
    };
    setModules(modules.map(m => 
      m.id === moduleId 
        ? { ...m, videos: [...m.videos, newVideo] }
        : m
    ));
  };

  const removeVideo = (moduleId: string, videoId: string) => {
    setModules(modules.map(m => 
      m.id === moduleId 
        ? { ...m, videos: m.videos.filter(v => v.id !== videoId) }
        : m
    ));
  };

  const updateVideo = (moduleId: string, videoId: string, field: keyof Video, value: string) => {
    setModules(modules.map(m => 
      m.id === moduleId 
        ? {
            ...m, 
            videos: m.videos.map(v => 
              v.id === videoId ? { ...v, [field]: value } : v
            )
          }
        : m
    ));
  };

  const handleSave = async () => {
    if (saving) return; // Prevent double submission
    
    setSaving(true);
    
    try {
      console.log('Saving course...');
      
      const courseData = {
        title,
        description,
        instructor,
        difficulty,
        price: parseFloat(price),
        duration,
        thumbnail,
        category,
      };

      let courseId = id;

      if (isNew) {
        // Create new course
        const { data: newCourse, error: courseError } = await supabase
          .from('courses')
          .insert([courseData])
          .select()
          .single();

        if (courseError || !newCourse) {
          console.error('Error creating course:', courseError);
          toast({
            title: "Error",
            description: "Failed to create course",
            variant: "destructive",
          });
          return;
        }
        
        courseId = newCourse.id;
        console.log('New course created with ID:', courseId);
      } else {
        // Update existing course
        const { error: courseError } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', courseId);

        if (courseError) {
          console.error('Error updating course:', courseError);
          toast({
            title: "Error",
            description: "Failed to update course",
            variant: "destructive",
          });
          return;
        }

        // Delete existing modules and videos for update
        console.log('Deleting existing modules for course:', courseId);
        await supabase
          .from('course_modules')
          .delete()
          .eq('course_id', courseId);
      }

      // Save modules and videos
      console.log('Saving', modules.length, 'modules...');
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        
        const { data: savedModule, error: moduleError } = await supabase
          .from('course_modules')
          .insert([{
            course_id: courseId,
            title: module.title,
            description: module.description,
            order_index: i + 1
          }])
          .select()
          .single();

        if (moduleError || !savedModule) {
          console.error('Error saving module:', moduleError);
          continue;
        }

        console.log('Module saved:', savedModule.id, 'with', module.videos.length, 'videos');

        // Save videos for this module
        if (module.videos.length > 0) {
          const videoData = module.videos.map((video, videoIndex) => ({
            module_id: savedModule.id,
            title: video.title,
            youtube_url: video.youtubeId,
            duration: video.duration,
            order_index: videoIndex + 1
          }));

          const { error: videoError } = await supabase
            .from('module_videos')
            .insert(videoData);

          if (videoError) {
            console.error('Error saving videos:', videoError);
          } else {
            console.log('Videos saved for module:', savedModule.id);
          }
        }
      }

      toast({
        title: "Success!",
        description: isNew ? "Course created successfully" : "Course updated successfully",
      });
      
      navigate('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {isNew ? 'Create New Course' : 'Edit Course'}
          </h1>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Course'}
          </Button>
        </div>

        {/* Course Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter course description"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Instructor name"
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price ()</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 20 hours"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Programming"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
              />
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: 'Beginner' | 'Average' | 'Advanced') => setDifficulty(value)}>
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
          </CardContent>
        </Card>

        {/* Modules Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Course Modules</CardTitle>
            <Button onClick={addModule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </CardHeader>
          <CardContent>
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">Module {moduleIndex + 1}</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeModule(module.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <Label>Module Title</Label>
                    <Input
                      value={module.title}
                      onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                      placeholder="Enter module title"
                    />
                  </div>
                  
                  <div>
                    <Label>Module Description</Label>
                    <Textarea
                      value={module.description}
                      onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                      placeholder="Enter module description"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Videos */}
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Videos</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addVideo(module.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Video
                    </Button>
                  </div>
                  
                  {module.videos.map((video, videoIndex) => (
                    <div key={video.id} className="bg-white p-3 rounded border mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">Video {videoIndex + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeVideo(module.id, video.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <Input
                          value={video.title}
                          onChange={(e) => updateVideo(module.id, video.id, 'title', e.target.value)}
                          placeholder="Video title"
                        />
                        <Input
                          value={video.youtubeId}
                          onChange={(e) => updateVideo(module.id, video.id, 'youtubeId', e.target.value)}
                          placeholder="YouTube video ID"
                        />
                      </div>
                      
                      <Input
                        value={video.duration}
                        onChange={(e) => updateVideo(module.id, video.id, 'duration', e.target.value)}
                        placeholder="Duration (e.g., 10:30)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseEditor;
