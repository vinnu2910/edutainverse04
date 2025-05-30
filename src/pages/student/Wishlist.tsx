
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCourses, mockWishlist, mockEnrollments } from '../../data/mockData';
import { Heart, Users, Clock, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const StudentWishlist = () => {
  const [wishlist, setWishlist] = useState(mockWishlist);
  const wishlistCourses = mockCourses.filter(course => wishlist.includes(course.id));

  const removeFromWishlist = (courseId: string) => {
    setWishlist(wishlist.filter(id => id !== courseId));
    toast({
      title: "Removed from wishlist",
      description: "Course removed from your wishlist",
    });
  };

  const handleEnroll = (courseId: string, courseTitle: string) => {
    removeFromWishlist(courseId);
    toast({
      title: "Enrolled successfully!",
      description: `You are now enrolled in {courseTitle}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-600">Courses you want to take later</p>
        </div>

        {wishlistCourses.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Browse courses and add them to your wishlist</p>
            <Link to="/student/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(course.id)}
                      className="p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium w-fit {
                    course.category === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.category === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.category}
                  </span>
                  <CardDescription className="text-sm mt-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrollmentCount} students
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Instructor: {course.instructor}</p>
                  <div className="space-y-2">
                    {mockEnrollments.includes(course.id) ? (
                      <Link to={`/student/learn/{course.id}`}>
                        <Button className="w-full">Continue Learning</Button>
                      </Link>
                    ) : (
                      <Button 
                        onClick={() => handleEnroll(course.id, course.title)}
                        className="w-full"
                      >
                        Enroll Now
                      </Button>
                    )}
                    <Link to={`/student/courses/{course.id}`}>
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentWishlist;
