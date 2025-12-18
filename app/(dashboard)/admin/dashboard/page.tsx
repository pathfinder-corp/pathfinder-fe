'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Map, 
  ClipboardList, 
  TrendingUp,
  TrendingDown,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

import { adminService } from '@/services';
import type { 
  IDashboardOverview, 
  IDashboardUsers, 
  IDashboardRoadmaps, 
  IDashboardAssessments 
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeChart, setActiveChart] = useState<'users' | 'roadmaps' | 'assessments'>('users');

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [overviewRes, usersRes, roadmapsRes, assessmentsRes] = await Promise.all([
        adminService.getDashboardOverview(),
        adminService.getDashboardUsers(),
        adminService.getDashboardRoadmaps(),
        adminService.getDashboardAssessments()
      ]);

      setOverview(overviewRes);
      setUsersData(usersRes);
      setRoadmapsData(roadmapsRes);
      setAssessmentsData(assessmentsRes);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard fetch error:', error);
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