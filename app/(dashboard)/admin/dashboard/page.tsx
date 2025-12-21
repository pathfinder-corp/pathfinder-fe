'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Map, 
  ClipboardList, 
  TrendingUp,
  TrendingDown,
  Share2,
  GraduationCap,
  Handshake
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';

import { adminService } from '@/services';
import type { 
  IDashboardOverview, 
  IDashboardUsers, 
  IDashboardRoadmaps, 
  IDashboardAssessments,
  IAdminMentorStats,
  IAdminMentorshipStats
} from '@/types';

import { Skeleton } from '@/components/ui/skeleton';

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-5 py-3 shadow-lg">
        <p className="text-base text-neutral-300 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-base font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

interface IStatCardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  loading?: boolean;
}

function StatCard({ title, value, change, changeLabel, icon, iconBg = 'bg-neutral-800', loading }: IStatCardProps) {
  if (loading) {
    return (
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-4 bg-neutral-800" />
            <Skeleton className="h-12 w-28 mb-3 bg-neutral-800" />
            <Skeleton className="h-6 w-40 bg-neutral-800" />
          </div>
          <Skeleton className="size-14 rounded-lg bg-neutral-800" />
        </div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg text-neutral-400 mb-2">{title}</p>
          <p className="text-5xl font-bold mb-3">{value.toLocaleString()}</p>
          {change !== undefined && (
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="size-5 text-green-400" />
              ) : (
                <TrendingDown className="size-5 text-red-400" />
              )}
              <span className={`text-lg font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{change}
              </span>
              <span className="text-lg text-neutral-500">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className={`p-4 ${iconBg} rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<IDashboardOverview | null>(null);
  const [usersData, setUsersData] = useState<IDashboardUsers | null>(null);
  const [roadmapsData, setRoadmapsData] = useState<IDashboardRoadmaps | null>(null);
  const [assessmentsData, setAssessmentsData] = useState<IDashboardAssessments | null>(null);
  const [mentorStats, setMentorStats] = useState<IAdminMentorStats | null>(null);
  const [mentorshipStats, setMentorshipStats] = useState<IAdminMentorshipStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeChart, setActiveChart] = useState<'users' | 'roadmaps' | 'assessments'>('users');

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [overviewRes, usersRes, roadmapsRes, assessmentsRes, mentorStatsRes, mentorshipStatsRes] = await Promise.all([
        adminService.getDashboardOverview(),
        adminService.getDashboardUsers(),
        adminService.getDashboardRoadmaps(),
        adminService.getDashboardAssessments(),
        adminService.getMentorStats(),
        adminService.getMentorshipStats()
      ]);

      setOverview(overviewRes);
      setUsersData(usersRes);
      setRoadmapsData(roadmapsRes);
      setAssessmentsData(assessmentsRes);
      setMentorStats(mentorStatsRes);
      setMentorshipStats(mentorshipStatsRes);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load dashboard data';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatChartDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd');
    } catch {
      return dateStr;
    }
  };

  const chartDataMap = {
    users: usersData?.registrationTrend.map(item => ({
      date: formatChartDate(item.date),
      count: item.count
    })) || [],
    roadmaps: roadmapsData?.generationTrend.map(item => ({
      date: formatChartDate(item.date),
      count: item.count
    })) || [],
    assessments: assessmentsData?.creationTrend.map(item => ({
      date: formatChartDate(item.date),
      count: item.count
    })) || []
  };

  const chartConfig = {
    users: { label: 'User Registrations', color: '#ffffff' },
    roadmaps: { label: 'Roadmaps Created', color: '#06b6d4' },
    assessments: { label: 'Assessments Created', color: '#a855f7' }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold mb-3">Overview</h1>
        <p className="text-xl text-neutral-400">
          Platform statistics and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={overview?.totalUsers || 0}
          change={overview?.newUsersLast7Days}
          changeLabel="this week"
          icon={<Users className="size-7 text-white" />}
          loading={isLoading}
        />
        <StatCard
          title="Total Roadmaps"
          value={overview?.totalRoadmaps || 0}
          change={overview?.newRoadmapsLast7Days}
          changeLabel="this week"
          icon={<Map className="size-7 text-white" />}
          loading={isLoading}
        />
        <StatCard
          title="Total Assessments"
          value={overview?.totalAssessments || 0}
          change={overview?.newAssessmentsLast7Days}
          changeLabel="this week"
          icon={<ClipboardList className="size-7 text-white" />}
          loading={isLoading}
        />
        <StatCard
          title="Shared Roadmaps"
          value={roadmapsData?.sharedCount || 0}
          icon={<Share2 className="size-7 text-white" />}
          loading={isLoading}
        />
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-3xl font-semibold">Activity Trends</h3>
            <p className="text-lg text-neutral-400">Data for the last 7 days</p>
          </div>
          
          <div className="flex items-center">
            {(['users', 'roadmaps', 'assessments'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={`cursor-pointer px-5 py-3 text-lg font-medium transition-colors capitalize ${
                  activeChart === type
                    ? 'text-white bg-neutral-800 rounded-lg'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-[350px] w-full bg-neutral-800 rounded-lg" />
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDataMap[activeChart]}>
                <defs>
                  <linearGradient id={`gradient-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig[activeChart].color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartConfig[activeChart].color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#737373" 
                  fontSize={14} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#737373" 
                  fontSize={14} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name={chartConfig[activeChart].label}
                  stroke={chartConfig[activeChart].color} 
                  fillOpacity={1} 
                  fill={`url(#gradient-${activeChart})`} 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neutral-800 rounded-lg">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Mentors</h3>
                <p className="text-base text-neutral-400">Platform mentors overview</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{mentorStats?.total || 0}</p>
              <p className="text-md text-neutral-500 capitalize">total mentors</p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-[180px] w-full bg-neutral-800 rounded-lg" />
          ) : (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Active', value: mentorStats?.active || 0, fill: '#ffffff' },
                    { name: 'Inactive', value: mentorStats?.inactive || 0, fill: '#737373' },
                    { name: 'Accepting', value: mentorStats?.acceptingMentees || 0, fill: '#06b6d4' },
                  ]}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" horizontal={false} />
                  <XAxis type="number" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#737373" 
                    fontSize={14} 
                    tickLine={false} 
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                    {[
                      { name: 'Active', value: mentorStats?.active || 0, fill: '#ffffff' },
                      { name: 'Inactive', value: mentorStats?.inactive || 0, fill: '#737373' },
                      { name: 'Accepting', value: mentorStats?.acceptingMentees || 0, fill: '#06b6d4' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neutral-800 rounded-lg">
                <Handshake className="size-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Mentorships</h3>
                <p className="text-base text-neutral-400">Active relationships</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{mentorshipStats?.total || 0}</p>
              <p className="text-md text-neutral-500 capitalize">total mentorships</p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-[180px] w-full bg-neutral-800 rounded-lg" />
          ) : (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Active', value: mentorshipStats?.active || 0, fill: '#ffffff' },
                    { name: 'Completed', value: mentorshipStats?.completed || 0, fill: '#06b6d4' },
                    { name: 'Cancelled', value: mentorshipStats?.cancelled || 0, fill: '#a855f7' },
                  ]}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" horizontal={false} />
                  <XAxis type="number" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#737373" 
                    fontSize={14} 
                    tickLine={false} 
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                    {[
                      { name: 'Active', value: mentorshipStats?.active || 0, fill: '#ffffff' },
                      { name: 'Completed', value: mentorshipStats?.completed || 0, fill: '#06b6d4' },
                      { name: 'Cancelled', value: mentorshipStats?.cancelled || 0, fill: '#a855f7' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
          <h3 className="text-2xl font-semibold mb-5">Users by Role</h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 bg-neutral-800" />
                  <Skeleton className="h-6 w-16 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {usersData?.byRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <span className="text-lg text-neutral-300 capitalize">{item.role}</span>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
          <h3 className="text-2xl font-semibold mb-5">Users by Status</h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 bg-neutral-800" />
                  <Skeleton className="h-6 w-16 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {usersData?.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-full ${
                      item.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-lg text-neutral-300 capitalize">{item.status}</span>
                  </div>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
          <h3 className="text-2xl font-semibold mb-5">Assessments by Difficulty</h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 bg-neutral-800" />
                  <Skeleton className="h-6 w-16 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {assessmentsData?.byDifficulty.map((item) => (
                <div key={item.difficulty} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-full ${
                      item.difficulty === 'easy' ? 'bg-green-400' :
                      item.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="text-lg text-neutral-300 capitalize">{item.difficulty}</span>
                  </div>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
          <h3 className="text-2xl font-semibold mb-5">Popular Roadmap Topics</h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48 bg-neutral-800" />
                  <Skeleton className="h-6 w-12 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {roadmapsData?.popularTopics.slice(0, 5).map((item, index) => (
                <div key={item.topic} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-base text-neutral-500 w-6">{index + 1}.</span>
                    <span className="text-lg text-neutral-300 truncate max-w-[300px]">
                      {item.topic}
                    </span>
                  </div>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
          <h3 className="text-2xl font-semibold mb-5">Popular Assessment Domains</h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48 bg-neutral-800" />
                  <Skeleton className="h-6 w-12 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {assessmentsData?.popularDomains.slice(0, 5).map((item, index) => (
                <div key={item.domain} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-base text-neutral-500 w-6">{index + 1}.</span>
                    <span className="text-lg text-neutral-300 truncate max-w-[300px]">
                      {item.domain}
                    </span>
                  </div>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}