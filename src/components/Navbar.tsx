
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, BookOpen, Heart, BarChart3, Settings, Menu, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NavbarProps {
  isPublic?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isPublic = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "See you again soon!",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/20 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Edutainverse
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {!isPublic && user ? (
              // Authenticated user navigation
              <>
                {user.role === 'student' ? (
                  <>
                    <Link to="/student/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                      Dashboard
                    </Link>
                    <Link to="/student/courses" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                      Courses
                    </Link>
                    <Link to="/student/mylearning" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                      My Learning
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                      Dashboard
                    </Link>
                    <Link to="/admin/courses" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                      Courses
                    </Link>
                    <Link to="/admin/analytics/users" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                      User Analytics
                    </Link>
                    <Link to="/admin/analytics/courses" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                      Course Analytics
                    </Link>
                  </>
                )}
              </>
            ) : (
              // Public navigation
              <>
                <Link to="/courses" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                  Courses
                </Link>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* User Menu or Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!isPublic && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-slate-200/50 hover:ring-slate-300/50 transition-all duration-200">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-lg border-slate-200/50" align="end">
                  <div className="p-2">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <div className="border-t border-slate-200/50 my-1"></div>
                  {user.role === 'student' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/student/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/student/wishlist" className="flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/analytics/users" className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          User Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/analytics/courses" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Course Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/courses" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Courses
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <div className="border-t border-slate-200/50 my-1"></div>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-200">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
