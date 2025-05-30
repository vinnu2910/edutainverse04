
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Lock, Camera, Shield, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const StudentProfile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully",
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Profile Settings
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger 
              value="profile" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <User className="w-4 h-4 mr-2" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger 
              value="password"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50/50 rounded-t-lg">
                <CardTitle className="flex items-center text-2xl text-slate-800">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-lg">
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-8">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">Profile Photo</h3>
                    <p className="text-slate-600">Update your profile picture to personalize your account</p>
                    <Button variant="outline" className="border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Picture
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                {/* Profile Form */}
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 font-semibold">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-700 font-semibold">Account Type</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="role"
                        value="Student"
                        disabled
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-600"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50/50 rounded-t-lg">
                <CardTitle className="flex items-center text-2xl text-slate-800">
                  <Lock className="w-6 h-6 mr-3 text-red-600" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-lg">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-slate-700 font-semibold">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="pl-10 border-slate-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-700 font-semibold">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pl-10 border-slate-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pl-10 border-slate-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800 font-medium">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Make sure your password is at least 8 characters long and includes a mix of letters, numbers, and symbols.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StudentProfile;
