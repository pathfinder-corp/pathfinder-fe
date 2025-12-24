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
  Handshake,
  MessageSquare,
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
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

import { adminService } from '@/services';
import type {
  IDashboardOverview,
  IDashboardUsers,
  IDashboardRoadmaps,
  IDashboardAssessments,
  IAdminMentorStats,
  IAdminMentorshipStats,
  IAdminContactStats,
} from '@/types';

import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-800 px-5 py-3 shadow-lg">
        <p className="mb-1 text-base text-neutral-300">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="text-base font-semibold"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

const statusChartConfig = {
  pending: {
    label: 'Pending',
    color: '#eab308',
  },
  inProgress: {
    label: 'In Progress',
    color: '#3b82f6',
  },
  resolved: {
    label: 'Resolved',
    color: '#22c55e',
  },
  closed: {
    label: 'Closed',
    color: '#737373',
  },
} satisfies ChartConfig;

const typeChartConfig = {
  general: {
    label: 'General',
    color: '#737373',
  },
  suspended: {
    label: 'Suspended',
    color: '#ef4444',
  },
  feedback: {
    label: 'Feedback',
    color: '#a855f7',
  },
  support: {
    label: 'Support',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

interface IStatCardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg = 'bg-neutral-800',
  loading,
}: IStatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="mb-4 h-6 w-32 bg-neutral-800" />
            <Skeleton className="mb-3 h-12 w-28 bg-neutral-800" />
            <Skeleton className="h-6 w-40 bg-neutral-800" />
          </div>
          <Skeleton className="size-14 rounded-lg bg-neutral-800" />
        </div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7 transition-colors hover:border-neutral-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-lg text-neutral-400">{title}</p>
          <p className="mb-3 text-5xl font-bold">{value.toLocaleString()}</p>
          {change !== undefined && (
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="size-5 text-green-400" />
              ) : (
                <TrendingDown className="size-5 text-red-400" />
              )}
              <span
                className={`text-lg font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}
              >
                {isPositive ? '+' : ''}
                {change}
              </span>
              <span className="text-lg text-neutral-500">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className={`p-4 ${iconBg} rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<IDashboardOverview | null>(null);
  const [usersData, setUsersData] = useState<IDashboardUsers | null>(null);
  const [roadmapsData, setRoadmapsData] = useState<IDashboardRoadmaps | null>(
    null
  );
  const [assessmentsData, setAssessmentsData] =
    useState<IDashboardAssessments | null>(null);
  const [mentorStats, setMentorStats] = useState<IAdminMentorStats | null>(
    null
  );
  const [mentorshipStats, setMentorshipStats] =
    useState<IAdminMentorshipStats | null>(null);
  const [contactStats, setContactStats] = useState<IAdminContactStats | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeChart, setActiveChart] = useState<
    'users' | 'roadmaps' | 'assessments'
  >('users');

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [
        overviewRes,
        usersRes,
        roadmapsRes,
        assessmentsRes,
        mentorStatsRes,
        mentorshipStatsRes,
        contactStatsRes,
      ] = await Promise.all([
        adminService.getDashboardOverview(),
        adminService.getDashboardUsers(),
        adminService.getDashboardRoadmaps(),
        adminService.getDashboardAssessments(),
        adminService.getMentorStats(),
        adminService.getMentorshipStats(),
        adminService.getContactStats(),
      ]);

      setOverview(overviewRes);
      setUsersData(usersRes);
      setRoadmapsData(roadmapsRes);
      setAssessmentsData(assessmentsRes);
      setMentorStats(mentorStatsRes);
      setMentorshipStats(mentorshipStatsRes);
      setContactStats(contactStatsRes);
    } catch (error) {
      const errorMessage =
        error instanceof Error
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
    users:
      usersData?.registrationTrend.map((item) => ({
        date: formatChartDate(item.date),
        count: item.count,
      })) || [],
    roadmaps:
      roadmapsData?.generationTrend.map((item) => ({
        date: formatChartDate(item.date),
        count: item.count,
      })) || [],
    assessments:
      assessmentsData?.creationTrend.map((item) => ({
        date: formatChartDate(item.date),
        count: item.count,
      })) || [],
  };

  const chartConfig = {
    users: { label: 'User Registrations', color: '#ffffff' },
    roadmaps: { label: 'Roadmaps Created', color: '#ffffff' },
    assessments: { label: 'Assessments Created', color: '#ffffff' },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-5xl font-bold">Overview</h1>
        <p className="text-xl text-neutral-400">
          Platform statistics and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-3xl font-semibold">Activity Trends</h3>
            <p className="text-lg text-neutral-400">Data for the last 7 days</p>
          </div>

          <div className="flex items-center">
            {(['users', 'roadmaps', 'assessments'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={`cursor-pointer px-5 py-3 text-lg font-medium capitalize transition-colors ${
                  activeChart === type
                    ? 'rounded-lg bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-[350px] w-full rounded-lg bg-neutral-800" />
        ) : chartDataMap[activeChart].length === 0 ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-3 size-12 text-neutral-500" />
              <p className="text-lg text-neutral-400">
                No activity data available
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Activity trends will appear here once data is available
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDataMap[activeChart]}>
                <defs>
                  <linearGradient
                    id={`gradient-${activeChart}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={chartConfig[activeChart].color}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartConfig[activeChart].color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#404040"
                  vertical={false}
                />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-neutral-800 p-3">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Mentors</h3>
                <p className="text-base text-neutral-400">
                  Platform mentors overview
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{mentorStats?.total || 0}</p>
              <p className="text-md text-neutral-500 capitalize">
                total mentors
              </p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-[180px] w-full rounded-lg bg-neutral-800" />
          ) : mentorStats?.total === 0 || !mentorStats ? (
            <div className="flex h-[180px] items-center justify-center">
              <div className="text-center">
                <GraduationCap className="mx-auto mb-2 size-10 text-neutral-500" />
                <p className="text-base text-neutral-400">No mentors yet</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Mentor data will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Active',
                      value: mentorStats?.active || 0,
                      fill: '#ffffff',
                    },
                    {
                      name: 'Inactive',
                      value: mentorStats?.inactive || 0,
                      fill: '#737373',
                    },
                    {
                      name: 'Accepting',
                      value: mentorStats?.acceptingStudents || 0,
                      fill: '#06b6d4',
                    },
                  ]}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#404040"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#737373"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
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
                      {
                        name: 'Active',
                        value: mentorStats?.active || 0,
                        fill: '#ffffff',
                      },
                      {
                        name: 'Inactive',
                        value: mentorStats?.inactive || 0,
                        fill: '#737373',
                      },
                      {
                        name: 'Accepting',
                        value: mentorStats?.acceptingStudents || 0,
                        fill: '#06b6d4',
                      },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-neutral-800 p-3">
                <Handshake className="size-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Mentorships</h3>
                <p className="text-base text-neutral-400">
                  Active relationships
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">
                {mentorshipStats?.total || 0}
              </p>
              <p className="text-md text-neutral-500 capitalize">
                total mentorships
              </p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-[180px] w-full rounded-lg bg-neutral-800" />
          ) : mentorshipStats?.total === 0 || !mentorshipStats ? (
            <div className="flex h-[180px] items-center justify-center">
              <div className="text-center">
                <Handshake className="mx-auto mb-2 size-10 text-neutral-500" />
                <p className="text-base text-neutral-400">No mentorships yet</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Mentorship data will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Active',
                      value: mentorshipStats?.active || 0,
                      fill: '#ffffff',
                    },
                    {
                      name: 'Completed',
                      value: mentorshipStats?.completed || 0,
                      fill: '#06b6d4',
                    },
                  ]}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#404040"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#737373"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
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
                      {
                        name: 'Active',
                        value: mentorshipStats?.active || 0,
                        fill: '#ffffff',
                      },
                      {
                        name: 'Completed',
                        value: mentorshipStats?.completed || 0,
                        fill: '#06b6d4',
                      },
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-neutral-800 p-3">
                <MessageSquare className="size-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Contact Messages</h3>
                <p className="text-base text-neutral-400">Messages by status</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{contactStats?.total || 0}</p>
              <p className="text-md text-neutral-500 capitalize">
                total messages
              </p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full rounded-lg bg-neutral-800" />
          ) : contactStats?.total === 0 || !contactStats ? (
            <div className="flex h-[250px] items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-3 size-12 text-neutral-500" />
                <p className="text-lg text-neutral-400">
                  No contact messages yet
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Messages will appear here once received
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[250px]">
              <ChartContainer
                config={statusChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={[
                        {
                          name: 'pending',
                          value: contactStats?.pending || 0,
                          fill: '#eab308',
                        },
                        {
                          name: 'inProgress',
                          value: contactStats?.inProgress || 0,
                          fill: '#3b82f6',
                        },
                        {
                          name: 'resolved',
                          value: contactStats?.resolved || 0,
                          fill: '#22c55e',
                        },
                        {
                          name: 'closed',
                          value: contactStats?.closed || 0,
                          fill: '#737373',
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                    >
                      {[
                        {
                          name: 'pending',
                          value: contactStats?.pending || 0,
                          fill: '#eab308',
                        },
                        {
                          name: 'inProgress',
                          value: contactStats?.inProgress || 0,
                          fill: '#3b82f6',
                        },
                        {
                          name: 'resolved',
                          value: contactStats?.resolved || 0,
                          fill: '#22c55e',
                        },
                        {
                          name: 'closed',
                          value: contactStats?.closed || 0,
                          fill: '#737373',
                        },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-neutral-800 p-3">
                <MessageSquare className="size-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Contact Messages</h3>
                <p className="text-base text-neutral-400">Messages by type</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{contactStats?.total || 0}</p>
              <p className="text-md text-neutral-500 capitalize">
                total messages
              </p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full rounded-lg bg-neutral-800" />
          ) : contactStats?.total === 0 || !contactStats ? (
            <div className="flex h-[250px] items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-3 size-12 text-neutral-500" />
                <p className="text-lg text-neutral-400">
                  No contact messages yet
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Messages will appear here once received
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[250px]">
              <ChartContainer
                config={typeChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={[
                        {
                          name: 'general',
                          value: contactStats?.byType.general || 0,
                          fill: '#737373',
                        },
                        {
                          name: 'suspended',
                          value: contactStats?.byType.suspended || 0,
                          fill: '#ef4444',
                        },
                        {
                          name: 'feedback',
                          value: contactStats?.byType.feedback || 0,
                          fill: '#a855f7',
                        },
                        {
                          name: 'support',
                          value: contactStats?.byType.support || 0,
                          fill: '#3b82f6',
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                    >
                      {[
                        {
                          name: 'general',
                          value: contactStats?.byType.general || 0,
                          fill: '#737373',
                        },
                        {
                          name: 'suspended',
                          value: contactStats?.byType.suspended || 0,
                          fill: '#ef4444',
                        },
                        {
                          name: 'feedback',
                          value: contactStats?.byType.feedback || 0,
                          fill: '#a855f7',
                        },
                        {
                          name: 'support',
                          value: contactStats?.byType.support || 0,
                          fill: '#3b82f6',
                        },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <h3 className="mb-5 text-2xl font-semibold">Users by Role</h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 bg-neutral-800" />
                  <Skeleton className="h-6 w-16 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : !usersData?.byRole || usersData.byRole.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="mx-auto mb-2 size-8 text-neutral-500" />
                <p className="text-sm text-neutral-400">
                  No user data available
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {usersData.byRole.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between"
                >
                  <span className="text-lg text-neutral-300 capitalize">
                    {item.role}
                  </span>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <h3 className="mb-5 text-2xl font-semibold">Users by Status</h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 bg-neutral-800" />
                  <Skeleton className="h-6 w-16 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : !usersData?.byStatus || usersData.byStatus.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="mx-auto mb-2 size-8 text-neutral-500" />
                <p className="text-sm text-neutral-400">
                  No user status data available
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {usersData.byStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-3 rounded-full ${
                        item.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-lg text-neutral-300 capitalize">
                      {item.status}
                    </span>
                  </div>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <h3 className="mb-5 text-2xl font-semibold">
            Assessments by Difficulty
          </h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 bg-neutral-800" />
                  <Skeleton className="h-6 w-16 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : !assessmentsData?.byDifficulty ||
            assessmentsData.byDifficulty.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <ClipboardList className="mx-auto mb-2 size-8 text-neutral-500" />
                <p className="text-sm text-neutral-400">
                  No assessment data available
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {assessmentsData.byDifficulty.map((item) => (
                <div
                  key={item.difficulty}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-3 rounded-full ${
                        item.difficulty === 'easy'
                          ? 'bg-green-400'
                          : item.difficulty === 'medium'
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                      }`}
                    />
                    <span className="text-lg text-neutral-300 capitalize">
                      {item.difficulty}
                    </span>
                  </div>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <h3 className="mb-5 text-2xl font-semibold">
            Popular Roadmap Topics
          </h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48 bg-neutral-800" />
                  <Skeleton className="h-6 w-12 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : !roadmapsData?.popularTopics ||
            roadmapsData.popularTopics.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Map className="mx-auto mb-2 size-8 text-neutral-500" />
                <p className="text-sm text-neutral-400">
                  No roadmap topics available
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {roadmapsData.popularTopics.slice(0, 5).map((item, index) => (
                <div
                  key={item.topic}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-base text-neutral-500">
                      {index + 1}.
                    </span>
                    <span className="max-w-[300px] truncate text-lg text-neutral-300">
                      {item.topic}
                    </span>
                  </div>
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <h3 className="mb-5 text-2xl font-semibold">
            Popular Assessment Domains
          </h3>
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48 bg-neutral-800" />
                  <Skeleton className="h-6 w-12 bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : !assessmentsData?.popularDomains ||
            assessmentsData.popularDomains.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <ClipboardList className="mx-auto mb-2 size-8 text-neutral-500" />
                <p className="text-sm text-neutral-400">
                  No assessment domains available
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {assessmentsData.popularDomains.slice(0, 5).map((item, index) => (
                <div
                  key={item.domain}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-base text-neutral-500">
                      {index + 1}.
                    </span>
                    <span className="max-w-[300px] truncate text-lg text-neutral-300">
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
