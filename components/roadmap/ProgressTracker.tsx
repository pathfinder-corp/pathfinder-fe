'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { roadmapService } from '@/services';
import type { IPhaseProgress, IProgressResponse } from '@/types';
import { toast } from 'sonner';

interface ProgressTrackerProps {
  roadmapId: string;
  progress: IProgressResponse;
  phases: Array<{
    title: string;
    steps: Array<{ title: string }>;
  }>;
  milestones?: Array<{ title: string }>;
  onProgressUpdate?: (progress: IProgressResponse) => void;
}

export function ProgressTracker({
  roadmapId,
  progress,
  phases,
  milestones,
  onProgressUpdate,
}: ProgressTrackerProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStepToggle = async (
    phaseIndex: number,
    stepIndex: number,
    completed: boolean
  ) => {
    setIsUpdating(true);
    try {
      const updated = await roadmapService.updateProgress(roadmapId, {
        phaseIndex,
        stepIndex,
        completed,
      });
      onProgressUpdate?.(updated);
      toast.success(
        completed ? 'Step marked as complete!' : 'Step marked as incomplete'
      );
    } catch (error) {
      toast.error('Failed to update progress');
      console.error('Progress update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMilestoneToggle = async (
    milestoneIndex: number,
    completed: boolean
  ) => {
    setIsUpdating(true);
    try {
      const updated = await roadmapService.updateProgress(roadmapId, {
        milestoneIndex,
        completed,
      });
      onProgressUpdate?.(updated);
      toast.success(
        completed ? 'Milestone achieved! 🎉' : 'Milestone marked as incomplete'
      );
    } catch (error) {
      toast.error('Failed to update milestone');
      console.error('Milestone update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Overall Progress</h3>
          <span className="text-2xl font-bold text-primary">
            {Number(progress.overallProgress).toFixed(0)}%
          </span>
        </div>
        <Progress value={progress.overallProgress} className="h-3" />
        {progress.completedAt && (
          <p className="mt-2 text-sm text-muted-foreground">
            ✅ Completed on{' '}
            {new Date(progress.completedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase, phaseIndex) => {
          const phaseProgress = progress.phases[phaseIndex];
          if (!phaseProgress) return null;

          const completedSteps = phaseProgress.steps.filter(
            (s) => s.completed
          ).length;
          const totalSteps = phaseProgress.steps.length;
          const phasePercentage =
            totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

          return (
            <div key={phaseIndex} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                {phaseProgress.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <h4 className="font-medium">{phase.title}</h4>
                <span className="ml-auto text-sm text-muted-foreground">
                  {completedSteps}/{totalSteps} steps
                </span>
              </div>

              <Progress value={phasePercentage} className="mb-3 h-2" />

              <div className="space-y-2">
                {phase.steps.map((step, stepIndex) => {
                  const stepProgress = phaseProgress.steps[stepIndex];
                  if (!stepProgress) return null;

                  return (
                    <div
                      key={stepIndex}
                      className="flex items-center gap-2 rounded p-2 hover:bg-accent"
                    >
                      <Checkbox
                        checked={stepProgress.completed}
                        onCheckedChange={(checked) =>
                          handleStepToggle(
                            phaseIndex,
                            stepIndex,
                            checked as boolean
                          )
                        }
                        disabled={isUpdating}
                      />
                      <span
                        className={
                          stepProgress.completed
                            ? 'text-sm text-muted-foreground line-through'
                            : 'text-sm'
                        }
                      >
                        {step.title}
                      </span>
                      {stepProgress.completedAt && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(stepProgress.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      {milestones && milestones.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-3 font-medium">Milestones</h4>
          <div className="space-y-2">
            {milestones.map((milestone, index) => {
              const milestoneProgress = progress.milestones[index];
              if (!milestoneProgress) return null;

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded p-2 hover:bg-accent"
                >
                  <Checkbox
                    checked={milestoneProgress.completed}
                    onCheckedChange={(checked) =>
                      handleMilestoneToggle(index, checked as boolean)
                    }
                    disabled={isUpdating}
                  />
                  <span
                    className={
                      milestoneProgress.completed
                        ? 'text-sm text-muted-foreground line-through'
                        : 'text-sm font-medium'
                    }
                  >
                    {milestone.title}
                  </span>
                  {milestoneProgress.completedAt && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(
                        milestoneProgress.completedAt
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
