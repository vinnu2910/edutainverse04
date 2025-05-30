
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  const saveCourse = () => {
    if (!course.title || !course.description || !course.instructor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Course saved",
      description: "Course has been saved successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Course Editor</h1>
          <p className="text-gray-600">Create and edit your courses</p>
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
                    <CardDescription>Add modules and videos to your course</CardDescription>
                  </div>
                  <Button onClick={addModule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {course.modules.map((module, moduleIndex) => (
                  <Card key={module.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-4">
                          <div>
                            <Label>Module Title</Label>
                            <Input
                              value={module.title}
                              onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                              placeholder={`Module ${moduleIndex + 1} title`}
                            />
                          </div>
                          <div>
                            <Label>Module Description</Label>
                            <Textarea
                              value={module.description}
                              onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                              placeholder="Module description"
                              rows={2}
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteModule(module.id)}
                          className="ml-4 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Videos</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addVideo(module.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Video
                          </Button>
                        </div>
                        
                        {module.videos.map((video, videoIndex) => (
                          <div key={video.id} className="grid md:grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                            <div className="md:col-span-4">
                              <Label>Video Title</Label>
                              <Input
                                value={video.title}
                                onChange={(e) => updateVideo(module.id, video.id, 'title', e.target.value)}
                                placeholder={`Video ${videoIndex + 1} title`}
                              />
                            </div>
                            <div className="md:col-span-3">
                              <Label>YouTube ID</Label>
                              <Input
                                value={video.youtubeId}
                                onChange={(e) => updateVideo(module.id, video.id, 'youtubeId', e.target.value)}
                                placeholder="YouTube video ID"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Duration</Label>
                              <Input
                                value={video.duration}
                                onChange={(e) => updateVideo(module.id, video.id, 'duration', e.target.value)}
                                placeholder="5:30"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Order</Label>
                              <Input
                                type="number"
                                value={video.order}
                                onChange={(e) => updateVideo(module.id, video.id, 'order', parseInt(e.target.value) || 0)}
                                placeholder="0"
                              />
                            </div>
                            <div className="md:col-span-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteVideo(module.id, video.id)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {course.modules.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No modules added yet</p>
                    <Button onClick={addModule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Module
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button onClick={saveCourse} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseEditor;
