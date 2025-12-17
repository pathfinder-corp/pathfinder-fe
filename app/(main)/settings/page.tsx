'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  Lock, 
  Loader2, 
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores';
import { authService } from '@/services';
import type { IUserProfile } from '@/types';

import { TransitionPanel } from '@/components/motion-primitives/transition-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ActiveTab = 'profile' | 'password';

const TABS = [
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'password' as const, label: 'Password', icon: Lock },
];

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const activeIndex = TABS.findIndex(tab => tab.id === activeTab);

  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isResendingVerification, setIsResendingVerification] = useState<boolean>(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      const data = await authService.getProfile();
      setProfile(data);
      
      profileForm.setValue('firstName', data.firstName);
      profileForm.setValue('lastName', data.lastName);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [profileForm]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsSavingProfile(true);
      const updatedUser = await authService.updateProfile(data);
      
      setUser(updatedUser);
      setProfile(prev => prev ? { ...prev, ...updatedUser } : null);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsChangingPassword(true);
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      passwordForm.reset();
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password', {
        description: 'Please check your current password and try again',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleResendVerification = async () => {
    try {
      setIsResendingVerification(true);
      await authService.resendVerification();
      toast.success('Verification email sent', {
        description: 'Please check your inbox and spam folder',
      });
    } catch (error) {
      console.error('Failed to resend verification:', error);
      toast.error('Failed to send verification email', {
        description: 'Please try again later',
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-xl text-neutral-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-neutral-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer relative flex items-center gap-2 px-4 py-3 text-base font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
              {isActive && (
                <motion.span 
                  layoutId="activeSettingsTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" 
                />
              )}
            </button>
          );
        })}
      </div>

      <TransitionPanel
        activeIndex={activeIndex}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        variants={{
          enter: { opacity: 0, y: -20, filter: 'blur(4px)' },
          center: { opacity: 1, y: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, y: 20, filter: 'blur(4px)' },
        }}
      >
        <div className="space-y-6">
          {isLoadingProfile ? (
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="p-8 flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-neutral-400" />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Account Information</CardTitle>
                  <CardDescription className="text-base">
                    View your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-400">Email</Label>
                      <p className="text-lg font-medium">{profile?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400">Role</Label>
                      <Badge 
                        variant="outline" 
                        className="text-base capitalize border-neutral-700"
                      >
                        {profile?.role}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400">Email Verified</Label>
                      <div className="flex items-center gap-3">
                        {profile?.emailVerified ? (
                          <>
                            <CheckCircle className="size-5 text-green-500" />
                            <span className="text-green-500">Verified</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="size-5 text-yellow-500" />
                              <span className="text-yellow-500">Not verified</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isResendingVerification}
                              onClick={handleResendVerification}
                              className="h-8 text-sm dark:border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                            >
                              {isResendingVerification ? (
                                <>
                                  Sending...
                                  <Loader2 className="size-4 animate-spin" />
                                </>
                              ) : (
                                <>
                                  Resend
                                  <Mail className="size-4" />
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400">Status</Label>
                      <Badge 
                        variant="outline" 
                        className={`text-base capitalize ${
                          profile?.status === 'active' 
                            ? 'border-green-500 text-green-500' 
                            : 'border-red-500 text-red-500'
                        }`}
                      >
                        {profile?.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400">Last Login</Label>
                      <p className="text-base">{formatDate(profile?.lastLoginAt ?? null)}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400">Member Since</Label>
                      <p className="text-base">{formatDate(profile?.createdAt ?? null)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Personal Information</CardTitle>
                  <CardDescription className="text-base">
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-base">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          className="h-12 text-base bg-neutral-900/50 border-neutral-800"
                          {...profileForm.register('firstName')}
                        />
                        {profileForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500">
                            {profileForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-base">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Enter your last name"
                          className="h-12 text-base bg-neutral-900/50 border-neutral-800"
                          {...profileForm.register('lastName')}
                        />
                        {profileForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500">
                            {profileForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSavingProfile || !profileForm.formState.isDirty}
                      className="w-full !h-14 !text-[1.15rem] bg-white text-neutral-950 hover:bg-neutral-200"
                    >
                      {isSavingProfile ? (
                        <>
                          Saving...
                          <Loader2 className="size-5 animate-spin" />
                        </>
                      ) : (
                        <>
                          Save Changes
                          <Save className="size-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-neutral-800 bg-neutral-900/50">
            <CardHeader>
              <CardTitle className="text-2xl">Change Password</CardTitle>
              <CardDescription className="text-base">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-base">
                    Current Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      className="h-12 text-base bg-neutral-900/50 border-neutral-800 pr-12"
                      {...passwordForm.register('currentPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-base">
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      className="h-12 text-base bg-neutral-900/50 border-neutral-800 pr-12"
                      {...passwordForm.register('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                  <div className="text-sm text-neutral-500 space-y-1 mt-2">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>At least 8 characters</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one lowercase letter</li>
                      <li>At least one number</li>
                      <li>At least one special character (!@#$%^&*)</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base">
                    Confirm New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      className="h-12 text-base bg-neutral-900/50 border-neutral-800 pr-12"
                      {...passwordForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full !h-14 !text-[1.15rem] bg-white text-neutral-950 hover:bg-neutral-200"
                >
                  {isChangingPassword ? (
                    <>
                      Changing password...
                      <Loader2 className="size-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      Change Password
                      <Lock className="size-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </TransitionPanel>
    </div>
  );
}

