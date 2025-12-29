'use client';

import { Award, Flame, Star, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { gamificationService } from '@/services';
import type { BadgeTier, BadgeType, IBadge, IGamificationStats } from '@/types';
import { toast } from 'sonner';

const BADGE_ICONS: Record<BadgeType, typeof Trophy> = {
  first_roadmap: Star,
  roadmap_complete: Trophy,
  phase_master: Award,
  week_streak: Flame,
  month_streak: Flame,
  early_bird: Zap,
  night_owl: Zap,
  consistent_learner: TrendingUp,
  speed_learner: Zap,
  milestone_achiever: Award,
};

const BADGE_COLORS: Record<BadgeTier, string> = {
  bronze: 'text-amber-700',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-cyan-400',
  diamond: 'text-blue-400',
};

export function GamificationPanel() {
  const [stats, setStats] = useState<IGamificationStats | null>(null);
  const [badges, setBadges] = useState<IBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const [statsData, badgesData] = await Promise.all([
        gamificationService.getMyStats(),
        gamificationService.getMyBadges(),
      ]);
      setStats(statsData);
      setBadges(badgesData);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
      toast.error('Failed to load progress stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const xpPercentage = (stats.totalXp / (stats.totalXp + stats.xpToNextLevel)) * 100;

  return (
    <div className="space-y-4">
      {/* XP and Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Level {stats.level}</span>
            <div className="flex items-center gap-2 text-yellow-500">
              <Star className="h-5 w-5" />
              <span className="font-bold">{stats.totalXp} XP</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={xpPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {stats.xpToNextLevel} XP to level {stats.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">days</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Best</p>
              <p className="text-xl font-semibold">{stats.longestStreak} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
              <p className="text-2xl font-bold">{stats.roadmapsCompleted}</p>
              <p className="text-sm text-muted-foreground">Roadmaps</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <p className="text-2xl font-bold">{stats.milestonesCompleted}</p>
              <p className="text-sm text-muted-foreground">Milestones</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <p className="text-2xl font-bold">{stats.phasesCompleted}</p>
              <p className="text-sm text-muted-foreground">Phases</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="mx-auto mb-2 h-8 w-8 text-purple-500" />
              <p className="text-2xl font-bold">{stats.stepsCompleted}</p>
              <p className="text-sm text-muted-foreground">Steps</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Badges ({badges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {badges.slice(0, 6).map((badge) => {
                const Icon = BADGE_ICONS[badge.type] || Trophy;
                const colorClass = BADGE_COLORS[badge.tier] || 'text-gray-500';

                return (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center gap-2 rounded-lg border bg-card p-3 text-center hover:bg-accent"
                    title={`${badge.title}\n${badge.description}\n+${badge.xpAwarded} XP`}
                  >
                    <Icon className={`h-8 w-8 ${colorClass}`} />
                    <div className="w-full">
                      <p className="truncate text-xs font-medium">{badge.title}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {badge.tier}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            {badges.length > 6 && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                +{badges.length - 6} more badges
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
