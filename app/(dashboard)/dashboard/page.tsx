'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores';
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  Award,
  CheckCircle2,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { academicService } from '@/services';
import type { IAcademicProfile } from '@/types';
import { EDUCATION_LEVEL_LABELS, USER_ROLES } from '@/constants';

const STATS = [
  {
    title: 'Hồ sơ học tập',
    description: 'Quản lý thông tin học vấn',
    icon: GraduationCap,
    href: '/profile',
    color: 'text-blue-500',
    roles: ['student']
  },
  {
    title: 'Khóa học',
    description: 'Khám phá các khóa học',
    icon: BookOpen,
    href: '/courses',
    color: 'text-green-500',
    roles: ['student', 'counselor', 'admin']
  },
  {
    title: 'Khóa học của tôi',
    description: 'Theo dõi tiến độ học tập',
    icon: Award,
    href: '/my-courses',
    color: 'text-purple-500',
    roles: ['student']
  },
  {
    title: 'Lộ trình của tôi',
    description: 'Khuyến nghị từ AI',
    icon: TrendingUp,
    href: '/pathways',
    color: 'text-orange-500',
    roles: ['student']
  },
];

export default function DashboardPage() {
  const user = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<IAcademicProfile | null>(null);

  const isStudent = user?.role === USER_ROLES.STUDENT;

  useEffect(() => {
    if (isStudent) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [isStudent]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await academicService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Xin chào, {user.firstName}! 👋
        </h1>
        <p className="text-xl text-neutral-400 mt-2">
          Chào mừng quay trở lại. Hãy tiếp tục hành trình học tập của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.filter(stat => stat.roles.includes(user.role)).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.href}
              className="border-neutral-800 bg-neutral-950/50 hover:bg-neutral-900/50 transition-colors cursor-pointer"
            >
              <Link href={stat.href}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl mb-2">{stat.title}</CardTitle>
                  <CardDescription className="text-base">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {isStudent && (
        <Card className="border-neutral-800 bg-neutral-950/50">
          <CardHeader>
            <CardTitle className="text-2xl">
              {profile ? 'Hồ sơ học tập' : 'Hoạt động gần đây'}
            </CardTitle>
            <CardDescription className="text-lg">
              {profile ? 'Tổng quan về hồ sơ của bạn' : 'Theo dõi tiến độ học tập của bạn'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : profile ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-950/20 border border-green-800/50">
                  <CheckCircle2 className="size-8 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-500">Hồ sơ đã hoàn thiện</h3>
                    <p className="text-base text-neutral-400">
                      Cập nhật lần cuối: {new Date(profile.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
                    <p className="text-sm text-neutral-500 mb-1">Trình độ học vấn</p>
                    <p className="text-lg font-semibold">
                      {EDUCATION_LEVEL_LABELS[profile.currentLevel]}
                    </p>
                  </div>

                  {profile.institution && (
                    <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
                      <p className="text-sm text-neutral-500 mb-1">Trường học</p>
                      <p className="text-lg font-semibold">{profile.institution}</p>
                    </div>
                  )}

                  {profile.major && (
                    <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
                      <p className="text-sm text-neutral-500 mb-1">Chuyên ngành</p>
                      <p className="text-lg font-semibold">{profile.major}</p>
                    </div>
                  )}

                  {(profile.gpa !== undefined && profile.gpa !== null) && (
                    <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
                      <p className="text-sm text-neutral-500 mb-1">GPA</p>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        {Number(profile.gpa).toFixed(2)} / 4.0
                        {Number(profile.gpa) >= 3.5 && (
                          <TrendingUpIcon className="size-5 text-green-500" />
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {profile.academicInterests && profile.academicInterests.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold mb-3 text-neutral-400">Lĩnh vực quan tâm</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.academicInterests.map((interest) => (
                        <Badge 
                          key={interest} 
                          variant="outline" 
                          className="text-base px-3 py-1 bg-blue-950/30 border-blue-800/50 text-blue-400"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.subjectStrengths && profile.subjectStrengths.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold mb-3 text-neutral-400">Môn học thế mạnh</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.subjectStrengths.map((strength) => (
                        <Badge 
                          key={strength} 
                          variant="outline" 
                          className="text-base px-3 py-1 bg-green-950/30 border-green-800/50 text-green-400"
                        >
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-800">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile">
                      Xem chi tiết hồ sơ →
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="size-16 mx-auto mb-4 text-neutral-600" />
                <p className="text-neutral-400 mb-2 text-lg font-medium">
                  Bạn chưa có hồ sơ học tập
                </p>
                <p className="text-neutral-500 mb-6">
                  Hãy bắt đầu bằng cách tạo hồ sơ để nhận được khuyến nghị phù hợp!
                </p>
                <Button asChild>
                  <Link href="/profile">
                    Tạo hồ sơ ngay
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isStudent && (
        <Card className="border-neutral-800 bg-neutral-950/50">
          <CardHeader>
            <CardTitle className="text-2xl">Tổng quan hệ thống</CardTitle>
            <CardDescription className="text-lg">
              {user.role === USER_ROLES.ADMIN ? 'Quản lý toàn bộ hệ thống' : 'Theo dõi học viên'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Award className="size-16 mx-auto mb-4 text-neutral-600" />
              <p className="text-neutral-400 text-lg">
                {user.role === USER_ROLES.ADMIN 
                  ? 'Chào mừng Admin! Sử dụng menu bên trái để quản lý khóa học và học viên.'
                  : 'Chào mừng Counselor! Sử dụng menu bên trái để xem thông tin học viên.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}