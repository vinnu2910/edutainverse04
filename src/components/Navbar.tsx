
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Home, BookOpen, Heart, BarChart3, Users, Menu, X, GraduationCap } from 'lucide-react';

interface NavbarProps {
  isPublic?: boolean;
}

const Navbar = ({ isPublic = false }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const StudentNavLinks = () => (
    <>
      <Link
        to="/student/dashboard"
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive('/student/dashboard') 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/student/courses"
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive('/student/courses') 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>Browse Courses</span>
      </Link>
      <Link
        to="/student/mylearning"
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive('/student/mylearning') 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <GraduationCap className="w-4 h-4" />
        <span>My Learning</span>
      </Link>
      <Link
        to="/student/wishlist"
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive('/student/wishlist') 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <Heart className="w-4 h-4" />
        <span>Wishlist</span>
      </Link>
    </>
  );

  const AdminNavLinks = () => (
    <>
      <Link
        to="/admin/dashboard"
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive('/admin/dashboard') 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/admin/courses"
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive('/admin/courses') 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>Manage Courses</span>
      </Link>
      <Link
        to="/admin/analytics/users"
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive('/admin/analytics/users') 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>User Analytics</span>
      </Link>
      <Link
        to="/admin/analytics/courses"
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive('/admin/analytics/courses') 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Course Analytics</span>
      </Link>
    </>
  );

  if (isPublic) {
    return (
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edutainverse
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/courses"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/courses') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Courses</span>
              </Link>
              
              {!user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="ghost" className="hover:bg-blue-50 hover:text-blue-600">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
                  <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                    <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-blue-100 py-4 space-y-2">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                Home
              </Link>
              <Link to="/courses" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                Courses
              </Link>
              {!user ? (
                <>
                  <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                    Login
                  </Link>
                  <Link to="/signup" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                    className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edutainverse
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user?.role === 'student' ? <StudentNavLinks /> : <AdminNavLinks />}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="hidden md:block text-gray-700 font-medium">
              {user?.name}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    to={user?.role === 'admin' ? '/admin/dashboard' : '/student/profile'}
                    className="flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-blue-100 py-4 space-y-2">
            {user?.role === 'student' ? (
              <>
                <Link to="/student/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                  Dashboard
                </Link>
                <Link to="/student/courses" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                  Browse Courses
                </Link>
                <Link to="/student/mylearning" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                  My Learning
                </Link>
                <Link to="/student/wishlist" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                  Wishlist
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                  Dashboard
                </Link>
                <Link to="/admin/courses" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                  Manage Courses
                </Link>
                <Link to="/admin/analytics/users" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                  User Analytics
                </Link>
                <Link to="/admin/analytics/courses" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                  Course Analytics
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
