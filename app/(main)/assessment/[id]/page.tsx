'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  CheckCircle2,
  XCircle,
  X,
  Trophy,
  RotateCcw,
  Home,
  AlertCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BookOpen,
  ExternalLink,
  Target,
  Map,
  History as HistoryIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { assessmentService } from '@/services';
import type {
  IAssessment,
  IAssessmentResult,
  IAssessmentHistory,
} from '@/types';
import { useTour, type TourStep } from '@/hooks';
import { useUserStore } from '@/stores';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CircularProgress } from '@/components/ui/circular-progress';

type LoadingStates = {
  initial: boolean;
  starting: boolean;
  submitting: boolean;
  completing: boolean;
  retaking: boolean;
  loadingHistory: boolean;
};

type AnswerState = {
  [questionId: string]: {
    selectedIndex: number;
    isSubmitted: boolean;
    isCorrect?: boolean;
    correctAnswerIndex?: number;
    timeSpent: number;
  };
};

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUserStore();
  const { startTour } = useTour('assessment-tour-completed', user?.id);
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<IAssessment | null>(null);
  const [result, setResult] = useState<IAssessmentResult | null>(null);
  const [history, setHistory] = useState<IAssessmentHistory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    starting: false,
    submitting: false,
    completing: false,
    retaking: false,
    loadingHistory: false,
  });

  const updateLoadingState = useCallback(
    (key: keyof LoadingStates, value: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        updateLoadingState('initial', true);
        const data = await assessmentService.getAssessment(assessmentId);
        setAssessment(data);

        if (data.status === 'completed') {
          const resultData = await assessmentService.getResults(assessmentId);
          setResult(resultData);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load assessment';
        toast.error(errorMessage);
        router.push('/history');
      } finally {
        updateLoadingState('initial', false);
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId, router, updateLoadingState]);

  const handleStartAssessment = async () => {
    try {
      updateLoadingState('starting', true);
      const data = await assessmentService.startAssessment(assessmentId);
      setAssessment(data);
      setQuestionStartTime(Date.now());
      toast.success('Assessment started! Good luck!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to start assessment';
      toast.error(errorMessage);
    } finally {
      updateLoadingState('starting', false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (answers[currentQuestion?.id || '']?.isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || selectedOption === null) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      updateLoadingState('submitting', true);

      const response = await assessmentService.submitAnswer(assessmentId, {
        questionId: currentQuestion.id,
        selectedAnswerIndex: selectedOption,
        timeSpent,
      });

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          selectedIndex: selectedOption,
          isSubmitted: true,
          isCorrect: response.isCorrect,
          correctAnswerIndex: response.correctAnswerIndex,
          timeSpent,
        },
      }));

      setAssessment((prev) =>
        prev
          ? {
              ...prev,
              answeredCount: prev.answeredCount + 1,
            }
          : null
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit answer';
      toast.error(errorMessage);
    } finally {
      updateLoadingState('submitting', false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (assessment?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestion = assessment?.questions[currentQuestionIndex - 1];
      if (prevQuestion && answers[prevQuestion.id]) {
        setSelectedOption(answers[prevQuestion.id].selectedIndex);
      } else {
        setSelectedOption(null);
      }
    }
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  const handleCompleteAssessment = async () => {
    try {
      updateLoadingState('completing', true);
      const resultData =
        await assessmentService.completeAssessment(assessmentId);
      setResult(resultData);
      setAssessment((prev) => (prev ? { ...prev, status: 'completed' } : null));
      toast.success('Assessment completed!');

      sessionStorage.setItem('start-assessment-tour', 'true');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to complete assessment. Make sure all questions are answered.';
      toast.error(errorMessage);
    } finally {
      updateLoadingState('completing', false);
    }
  };

  const handleRetake = async () => {
    try {
      updateLoadingState('retaking', true);
      const newAssessment =
        await assessmentService.retakeAssessment(assessmentId);
      toast.success(`Starting attempt ${newAssessment.attemptNumber}!`);
      router.push(`/assessment/${newAssessment.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create retake';
      toast.error(errorMessage);
    } finally {
      updateLoadingState('retaking', false);
    }
  };

  const loadHistory = async () => {
    try {
      updateLoadingState('loadingHistory', true);
      const historyData =
        await assessmentService.getAssessmentHistory(assessmentId);
      setHistory(historyData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load history';
      toast.error(errorMessage);
    } finally {
      updateLoadingState('loadingHistory', false);
    }
  };

  useEffect(() => {
    if (assessment?.status === 'completed') {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.status]);

  const currentQuestion = assessment?.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const isAllAnswered = assessment
    ? assessment.answeredCount >= assessment.questionCount
    : false;
  const progressPercent = assessment
    ? (assessment.answeredCount / assessment.questionCount) * 100
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getOptionStyle = (index: number) => {
    const baseStyle =
      'w-full p-7 rounded-xl border text-left transition-all duration-200 flex items-start gap-6';

    if (!currentAnswer?.isSubmitted) {
      if (selectedOption === index) {
        return `${baseStyle} border-neutral-600 bg-white/10`;
      }
      return `${baseStyle} border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 cursor-pointer`;
    }

    if (currentAnswer.isCorrect && currentAnswer.selectedIndex === index) {
      return `${baseStyle} border-green-500 bg-green-500/10`;
    }

    if (!currentAnswer.isCorrect && currentAnswer.selectedIndex === index) {
      return `${baseStyle} border-red-500 bg-red-500/10`;
    }

    if (
      !currentAnswer.isCorrect &&
      currentAnswer.correctAnswerIndex === index
    ) {
      return `${baseStyle} border-green-500 bg-green-500/10`;
    }

    return `${baseStyle} border-neutral-800 bg-neutral-900/30 opacity-50`;
  };

  useEffect(() => {
    if (assessment?.status !== 'completed' || !result) return;

    const shouldStartTour =
      sessionStorage.getItem('start-assessment-tour') === 'true';
    if (!shouldStartTour) return;

    sessionStorage.removeItem('start-assessment-tour');

    const waitForElement = (
      selector: string,
      maxAttempts = 20,
      interval = 200
    ): Promise<Element | null> => {
      return new Promise((resolve) => {
        let attempts = 0;
        const checkElement = () => {
          const element = document.querySelector(selector);
          if (element) {
            resolve(element);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkElement, interval);
          } else {
            resolve(null);
          }
        };
        checkElement();
      });
    };

    const startTourWhenReady = async () => {
      try {
        const scoreCard = await waitForElement(
          '[data-driver="assessment-score-card"]'
        );
        const resultsBreakdown = await waitForElement(
          '[data-driver="assessment-results-breakdown"]'
        );
        const summarySection = await waitForElement(
          '[data-driver="assessment-summary"]'
        );
        const suggestedRoadmaps = await waitForElement(
          '[data-driver="assessment-suggested-roadmaps"]'
        );
        const questionBreakdown = await waitForElement(
          '[data-driver="assessment-question-breakdown"]'
        );
        const attemptHistory = await waitForElement(
          '[data-driver="assessment-attempt-history"]'
        );

        if (!scoreCard) {
          console.warn('Assessment score card not found, skipping tour');
          return;
        }

        const tourSteps: TourStep[] = [
          {
            element: '[data-driver="assessment-score-card"]',
            popover: {
              title: 'Your Assessment Results!',
              description:
                "Here's your overall score and performance. Review your results to understand your strengths and areas for improvement.",
              side: 'bottom',
              align: 'center',
            },
          },
        ];

        if (resultsBreakdown) {
          tourSteps.push({
            element: '[data-driver="assessment-results-breakdown"]',
            popover: {
              title: 'Results Breakdown',
              description:
                'See a detailed breakdown of your correct and incorrect answers with visual progress indicators.',
              side: 'top',
              align: 'center',
            },
          });
        }

        if (summarySection) {
          tourSteps.push({
            element: '[data-driver="assessment-summary"]',
            popover: {
              title: 'Detailed Summary',
              description:
                'Get insights into your strengths, weaknesses, topics to review, and personalized study recommendations.',
              side: 'top',
              align: 'center',
            },
          });
        }

        if (suggestedRoadmaps) {
          tourSteps.push({
            element: '[data-driver="assessment-suggested-roadmaps"]',
            popover: {
              title: 'Suggested Roadmaps',
              description:
                'Explore personalized learning roadmaps based on your assessment results to continue your learning journey.',
              side: 'top',
              align: 'center',
            },
          });
        }

        if (questionBreakdown) {
          tourSteps.push({
            element: '[data-driver="assessment-question-breakdown"]',
            popover: {
              title: 'Question Breakdown',
              description:
                'Review each question with explanations to understand why answers were correct or incorrect.',
              side: 'top',
              align: 'center',
            },
          });
        }

        if (attemptHistory) {
          tourSteps.push({
            element: '[data-driver="assessment-attempt-history"]',
            popover: {
              title: 'Attempt History',
              description:
                'Track your progress across multiple attempts. View your best score, average performance, and detailed history of all attempts.',
              side: 'top',
              align: 'center',
            },
          });
        }

        setTimeout(() => {
          startTour(tourSteps);
        }, 300);
      } catch (error) {
        console.error('Error starting assessment tour:', error);
      }
    };

    startTourWhenReady();
  }, [assessment?.status, result, startTour]);

  if (loadingStates.initial) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <Skeleton className="mb-4 h-10 w-72 bg-neutral-800" />
        <Skeleton className="mb-8 h-6 w-96 bg-neutral-800" />
        <Skeleton className="h-[500px] w-full rounded-xl bg-neutral-800" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <AlertCircle className="mb-6 size-20 text-neutral-500" />
        <h2 className="mb-3 text-3xl font-bold">Assessment not found</h2>
        <p className="mb-8 text-lg text-neutral-400">
          The assessment you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button
          onClick={() => router.push('/history')}
          className="h-14! text-lg!"
        >
          <Home className="size-5" />
          Back to History
        </Button>
      </div>
    );
  }

  if (assessment.status === 'completed' && result) {
    const scorePercent = Math.round(
      (result.correctCount / result.totalQuestions) * 100
    );
    const incorrectCount = result.totalQuestions - result.correctCount;

    const getScoreColor = () => {
      if (scorePercent >= 80) return 'text-green-400';
      if (scorePercent >= 60) return 'text-yellow-400';
      return 'text-red-400';
    };

    const getProgressColor = () => {
      if (scorePercent >= 80) return 'stroke-green-500';
      if (scorePercent >= 60) return 'stroke-yellow-500';
      return 'stroke-red-500';
    };

    const getPerformanceLabel = () => {
      if (scorePercent >= 90)
        return { text: 'Excellent!', color: 'text-green-400' };
      if (scorePercent >= 80)
        return { text: 'Great Job!', color: 'text-green-400' };
      if (scorePercent >= 60)
        return { text: 'Good Effort', color: 'text-yellow-400' };
      if (scorePercent >= 40)
        return { text: 'Needs Work', color: 'text-orange-400' };
      return { text: 'Keep Learning', color: 'text-red-400' };
    };

    const performance = getPerformanceLabel();

    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div
          className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-10"
          data-driver="assessment-score-card"
        >
          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div className="shrink-0">
              <CircularProgress
                value={scorePercent}
                size={140}
                strokeWidth={12}
                progressColor={getProgressColor()}
              >
                <div className="text-center">
                  <p className={`text-4xl font-bold ${getScoreColor()}`}>
                    {scorePercent}%
                  </p>
                </div>
              </CircularProgress>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="mb-3 text-5xl font-bold">Assessment Complete!</h1>
              <p className={`mb-4 text-3xl font-semibold ${performance.color}`}>
                {performance.text}
              </p>
              <p className="mb-5 text-2xl text-neutral-400">
                {assessment.domain}
              </p>

              <p className="text-lg text-neutral-300">
                You scored{' '}
                <span className="font-semibold text-white">
                  {result.correctCount}
                </span>{' '}
                out of{' '}
                <span className="font-semibold text-white">
                  {result.totalQuestions}
                </span>{' '}
                questions correctly
              </p>
            </div>
          </div>
        </div>

        <div
          className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-7"
          data-driver="assessment-results-breakdown"
        >
          <h2 className="mb-6 text-2xl font-bold">Results Breakdown</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-green-400" />
                <span className="text-lg text-neutral-300">Correct</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold">
                  {result.correctCount} (
                  {Math.round(
                    (result.correctCount / result.totalQuestions) * 100
                  )}
                  %)
                </span>
                <div className="h-2.5 w-56 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${(result.correctCount / result.totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="size-6 text-red-400" />
                <span className="text-lg text-neutral-300">Incorrect</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold">
                  {incorrectCount} (
                  {Math.round((incorrectCount / result.totalQuestions) * 100)}%)
                </span>
                <div className="h-2.5 w-56 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${(incorrectCount / result.totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {result.summary && (
          <div
            className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-7"
            data-driver="assessment-summary"
          >
            <h2 className="mb-6 text-2xl font-bold">
              Summary of your Assessment
            </h2>
            <div className="space-y-7">
              {result.summary.overallAssessment && (
                <p className="text-lg leading-relaxed text-neutral-300">
                  {result.summary.overallAssessment}
                </p>
              )}

              {result.summary.strengths &&
                result.summary.strengths.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2.5">
                      <TrendingUp className="size-6 text-white" />
                      <h3 className="text-xl font-semibold text-white">
                        Strengths
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {result.summary.strengths.map((strength, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-lg text-neutral-300"
                        >
                          <CheckCircle2 className="mt-1 size-5 shrink-0 text-neutral-400" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {result.summary.weaknesses &&
                result.summary.weaknesses.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2.5">
                      <TrendingDown className="size-6 text-white" />
                      <h3 className="text-xl font-semibold text-white">
                        Weaknesses
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {result.summary.weaknesses.map((weakness, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-lg text-neutral-300"
                        >
                          <XCircle className="mt-1 size-5 shrink-0 text-neutral-400" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {result.summary.topicsToReview &&
                result.summary.topicsToReview.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2.5">
                      <Target className="size-6 text-white" />
                      <h3 className="text-xl font-semibold text-white">
                        Topics to Review
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {result.summary.topicsToReview.map((topic, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-lg text-neutral-300"
                        >
                          <BookOpen className="mt-1 size-5 shrink-0 text-neutral-400" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {result.summary.studyRecommendations &&
                result.summary.studyRecommendations.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2.5">
                      <Sparkles className="size-6 text-white" />
                      <h3 className="text-xl font-semibold text-white">
                        Study Recommendations
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {result.summary.studyRecommendations.map(
                        (recommendation, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-lg text-neutral-300"
                          >
                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-bold text-white">
                              {idx + 1}
                            </span>
                            <span>{recommendation}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        )}

        {result.suggestedRoadmaps && result.suggestedRoadmaps.length > 0 && (
          <div
            className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-7"
            data-driver="assessment-suggested-roadmaps"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Suggested Roadmaps</h2>
              <p className="text-base text-neutral-400">
                Explore these roadmaps to improve your understanding
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {result.suggestedRoadmaps.map((roadmap, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(
                      `/roadmap?topic=${encodeURIComponent(roadmap.topic)}&from=assessment`
                    );
                  }}
                  className="group flex cursor-pointer items-start gap-4 rounded-xl border border-neutral-700 bg-neutral-800/50 p-6 text-left transition-all hover:border-neutral-500 hover:bg-neutral-800"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-neutral-700">
                    <Map className="size-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-semibold text-white transition-colors group-hover:text-neutral-300">
                      {roadmap.topic}
                    </h4>
                  </div>
                  <ExternalLink className="mt-1 size-5 shrink-0 text-neutral-500 transition-colors group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-7"
          data-driver="assessment-question-breakdown"
        >
          <h2 className="mb-7 text-2xl font-bold">Question Breakdown</h2>
          <div className="custom-scrollbar max-h-[500px] space-y-6 overflow-y-auto pr-2">
            {result.questionBreakdown.map((q, index) => (
              <div
                key={q.questionId}
                className={`rounded-xl border p-7 ${
                  q.isCorrect
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <p className="text-xl font-medium">
                    <span className="mr-2 text-neutral-500">Q{index + 1}.</span>
                    {q.questionText}
                  </p>
                  {q.isCorrect ? (
                    <CheckCircle2 className="size-7 shrink-0 text-green-400" />
                  ) : (
                    <XCircle className="size-7 shrink-0 text-red-400" />
                  )}
                </div>

                <div className="mb-5 space-y-2.5">
                  {q.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`rounded-lg px-5 py-3 text-lg ${
                        optIndex === q.correctAnswerIndex
                          ? 'bg-green-500/20 text-green-300'
                          : optIndex === q.selectedAnswerIndex && !q.isCorrect
                            ? 'bg-red-500/20 text-red-300 line-through'
                            : 'text-neutral-500'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="mt-5 border-t border-neutral-800 pt-5">
                    <p className="text-lg text-neutral-400">
                      <span className="font-medium text-neutral-300">
                        Explanation:{' '}
                      </span>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {history && history.totalAttempts > 1 && (
          <div
            className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-7"
            data-driver="assessment-attempt-history"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Attempt History</h2>
              <Badge variant="outline" className="px-4 py-2 text-lg">
                {history.totalAttempts} Attempts
              </Badge>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-5">
                <p className="mb-2 text-sm text-neutral-400">Best Score</p>
                <p className="text-3xl font-bold text-green-400">
                  {history.bestScore !== null && history.bestScore !== undefined
                    ? `${history.bestScore.toFixed(1)}%`
                    : 'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-5">
                <p className="mb-2 text-sm text-neutral-400">Latest Score</p>
                <p className="text-3xl font-bold text-orange-400">
                  {history.latestScore !== null &&
                  history.latestScore !== undefined
                    ? `${history.latestScore.toFixed(1)}%`
                    : 'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-5">
                <p className="mb-2 text-sm text-neutral-400">Current Attempt</p>
                <p className="text-3xl font-bold">{assessment.attemptNumber}</p>
              </div>
            </div>

            <div className="space-y-3">
              {history.attempts.map((attempt, index) => {
                const isCurrentAttempt = attempt.id === assessmentId;
                return (
                  <div
                    key={attempt.id}
                    onClick={() => {
                      if (!isCurrentAttempt) {
                        router.push(`/assessment/${attempt.id}`);
                      }
                    }}
                    className={`flex items-center justify-between rounded-xl border p-5 transition-all ${
                      isCurrentAttempt
                        ? 'border-neutral-500 bg-neutral-800'
                        : 'cursor-pointer border-neutral-700 bg-neutral-800/50 hover:border-neutral-500 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex size-12 items-center justify-center rounded-full text-xl font-bold ${
                          isCurrentAttempt
                            ? 'bg-neutral-700 text-white'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {attempt.attemptNumber}
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          Attempt {attempt.attemptNumber}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {new Date(attempt.createdAt).toLocaleDateString()} at{' '}
                          {new Date(attempt.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {attempt.status === 'completed' &&
                    attempt.score !== null &&
                    attempt.score !== undefined ? (
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {Number(attempt.score).toFixed(1)}%
                        </p>
                        <p className="text-sm text-neutral-400">
                          {attempt.correctCount}/{attempt.totalQuestions}{' '}
                          correct
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-neutral-400">
                        {attempt.status === 'in_progress'
                          ? 'In Progress'
                          : 'Not Started'}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleRetake}
            disabled={loadingStates.retaking}
            className="h-16! text-xl!"
          >
            {loadingStates.retaking ? (
              <>
                Creating Retake...
                <Loader2 className="size-6 animate-spin" />
              </>
            ) : (
              <>
                Retake Assessment
                <RotateCcw className="size-6" />
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/assessment')}
            className="h-16! text-xl!"
          >
            New Assessment
            <Sparkles className="size-6" />
          </Button>
          <Button
            size="lg"
            onClick={() => router.push('/history')}
            className="h-16! text-xl!"
          >
            View All History
            <ChevronRight className="size-6" />
          </Button>
        </div>

        <p className="mt-10 text-center text-lg text-neutral-500">
          AI can make mistakes, make sure to verify important information
        </p>
      </div>
    );
  }

  if (assessment.status === 'pending') {
    return (
      <div className="mx-auto w-232 py-12">
        <div className="text-center">
          <div className="mb-10 inline-flex size-28 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50">
            <Sparkles className="size-14 text-white" />
          </div>

          <h1 className="mb-6 text-6xl font-bold">{assessment.domain}</h1>

          <div className="mb-12 flex items-center justify-center gap-4">
            <Badge
              variant="outline"
              className={`px-5 py-2 text-lg capitalize ${getDifficultyColor(assessment.difficulty)}`}
            >
              {assessment.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className="border-neutral-700 px-5 py-2 text-lg text-neutral-300 capitalize"
            >
              {assessment.questionCount} questions
            </Badge>
          </div>

          <div className="mb-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-12">
            <h2 className="mb-8 text-3xl font-semibold">Before you begin</h2>
            <ul className="mx-auto max-w-lg space-y-5 text-left text-neutral-400">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-green-400" />
                <span className="text-xl">
                  Read each question carefully before selecting an answer
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-green-400" />
                <span className="text-xl">
                  You can navigate between questions using the arrows
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-green-400" />
                <span className="text-xl">
                  Click &quot;Check Answer&quot; to submit your response
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-green-400" />
                <span className="text-xl">
                  Complete all questions to see your final results
                </span>
              </li>
            </ul>
          </div>

          <Button
            size="lg"
            onClick={handleStartAssessment}
            disabled={loadingStates.starting}
            className="h-16! px-14! text-xl!"
          >
            {loadingStates.starting ? (
              <>
                Starting...
                <Loader2 className="size-6 animate-spin" />
              </>
            ) : (
              <>
                Start Assessment
                <ChevronRight className="size-6" />
              </>
            )}
          </Button>
          <p className="mt-10 text-center text-xl text-neutral-500">
            AI can make mistakes, make sure to verify important information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-232 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="size-14"
          >
            <ChevronLeft className="size-7" />
          </Button>
          <span className="text-2xl font-medium">
            Question{' '}
            <span className="text-white">{currentQuestionIndex + 1}</span> of{' '}
            {assessment.questionCount}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex >= assessment.questionCount - 1}
            className="size-14"
          >
            <ChevronRight className="size-7" />
          </Button>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-xl text-neutral-400">
            {Math.round(progressPercent)}% complete
          </span>
          <Badge
            variant="outline"
            className={`px-4 py-1.5 text-lg capitalize ${getDifficultyColor(assessment.difficulty)}`}
          >
            {assessment.difficulty}
          </Badge>
        </div>
      </div>

      <Progress value={progressPercent} className="mb-12 h-3" />

      {currentQuestion && (
        <div className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12">
          <h2 className="mb-12 text-2xl leading-relaxed font-bold">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={currentAnswer?.isSubmitted}
                className={getOptionStyle(index)}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 ${!currentAnswer?.isSubmitted && selectedOption === index ? 'border-white bg-white' : ''} ${!currentAnswer?.isSubmitted && selectedOption !== index ? 'border-neutral-600' : ''} ${
                    currentAnswer?.isSubmitted &&
                    currentAnswer.selectedIndex === index &&
                    currentAnswer.isCorrect
                      ? 'border-green-500 bg-green-500'
                      : ''
                  } ${
                    currentAnswer?.isSubmitted &&
                    currentAnswer.selectedIndex === index &&
                    !currentAnswer.isCorrect
                      ? 'border-red-500 bg-red-500'
                      : ''
                  } ${
                    currentAnswer?.isSubmitted &&
                    !currentAnswer.isCorrect &&
                    currentAnswer.correctAnswerIndex === index
                      ? 'border-green-500 bg-green-500'
                      : ''
                  } ${
                    currentAnswer?.isSubmitted &&
                    currentAnswer.selectedIndex !== index &&
                    currentAnswer.correctAnswerIndex !== index
                      ? 'border-neutral-700'
                      : ''
                  } `}
                >
                  {currentAnswer?.isSubmitted &&
                  currentAnswer.selectedIndex === index ? (
                    currentAnswer.isCorrect ? (
                      <Check className="size-6 text-white" />
                    ) : (
                      <X className="size-6 text-white" />
                    )
                  ) : currentAnswer?.isSubmitted &&
                    !currentAnswer.isCorrect &&
                    currentAnswer.correctAnswerIndex === index ? (
                    <Check className="size-6 text-white" />
                  ) : (
                    !currentAnswer?.isSubmitted &&
                    selectedOption === index && (
                      <div className="size-3.5 rounded-full bg-neutral-900" />
                    )
                  )}
                </div>
                <span className="text-xl">{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSkipQuestion}
          disabled={
            currentQuestionIndex >= assessment.questionCount - 1 ||
            loadingStates.submitting
          }
          className="h-16! text-xl!"
        >
          Skip Question
        </Button>

        <div className="flex items-center gap-4">
          {!currentAnswer?.isSubmitted ? (
            <Button
              size="lg"
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || loadingStates.submitting}
              className="h-16! text-xl!"
            >
              {loadingStates.submitting ? (
                <>
                  Checking...
                  <Loader2 className="size-6 animate-spin" />
                </>
              ) : (
                'Check Answer'
              )}
            </Button>
          ) : (
            currentQuestionIndex < assessment.questionCount - 1 && (
              <Button
                size="lg"
                onClick={handleNextQuestion}
                className="h-16! text-xl!"
              >
                Next Question
                <ChevronRight className="size-6" />
              </Button>
            )
          )}

          {isAllAnswered && (
            <Button
              size="lg"
              variant="outline"
              onClick={handleCompleteAssessment}
              disabled={loadingStates.completing}
              className="h-16! border-green-500/50! text-xl! text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-400"
            >
              {loadingStates.completing ? (
                <>
                  Completing...
                  <Loader2 className="size-6 animate-spin" />
                </>
              ) : (
                <>
                  Complete Assessment
                  <Trophy className="size-6" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-10 text-center text-xl text-neutral-500">
        AI can make mistakes, make sure to verify important information
      </p>
    </div>
  );
}
