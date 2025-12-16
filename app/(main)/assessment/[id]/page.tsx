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
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { assessmentService } from '@/services';
import type { IAssessment, IAssessmentResult } from '@/types';

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
};

type AnswerState = {
  [questionId: string]: {
    selectedIndex: number;
    isSubmitted: boolean;
    isCorrect?: boolean;
    timeSpent: number;
  };
};

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<IAssessment | null>(null);
  const [result, setResult] = useState<IAssessmentResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    starting: false,
    submitting: false,
    completing: false,
  });

  const updateLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

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
        toast.error('Failed to load assessment');
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
      toast.error('Failed to start assessment');
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
        timeSpent
      });

      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          selectedIndex: selectedOption,
          isSubmitted: true,
          isCorrect: response.isCorrect,
          timeSpent
        }
      }));

      setAssessment(prev => prev ? {
        ...prev,
        answeredCount: prev.answeredCount + 1
      } : null);

    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      updateLoadingState('submitting', false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (assessment?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
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
      const resultData = await assessmentService.completeAssessment(assessmentId);
      setResult(resultData);
      setAssessment(prev => prev ? { ...prev, status: 'completed' } : null);
      toast.success('Assessment completed!');
    } catch (error) {
      toast.error('Failed to complete assessment. Make sure all questions are answered.');
    } finally {
      updateLoadingState('completing', false);
    }
  };

  const currentQuestion = assessment?.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const isAllAnswered = assessment ? assessment.answeredCount >= assessment.questionCount : false;
  const progressPercent = assessment ? (assessment.answeredCount / assessment.questionCount) * 100 : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getOptionStyle = (index: number) => {
    const baseStyle = 'w-full p-6 rounded-xl border text-left transition-all duration-200 flex items-start gap-5';
    
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
    return `${baseStyle} border-neutral-800 bg-neutral-900/30 opacity-50`;
  };

  if (loadingStates.initial) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Skeleton className="h-8 w-64 mb-4 bg-neutral-800" />
        <Skeleton className="h-4 w-96 mb-8 bg-neutral-800" />
        <Skeleton className="h-[500px] w-full rounded-xl bg-neutral-800" />
      </div>
      );
    }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="size-16 text-neutral-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Assessment not found</h2>
        <p className="text-neutral-400 mb-6">The assessment you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/history')}>
          <Home className="size-4 mr-2" />
          Back to History
        </Button>
      </div>
    );
  }

  if (assessment.status === 'completed' && result) {
    const scorePercent = Math.round((result.correctCount / result.totalQuestions) * 100);
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
      if (scorePercent >= 90) return { text: 'Excellent!', color: 'text-green-400' };
      if (scorePercent >= 80) return { text: 'Great Job!', color: 'text-green-400' };
      if (scorePercent >= 60) return { text: 'Good Effort', color: 'text-yellow-400' };
      if (scorePercent >= 40) return { text: 'Needs Work', color: 'text-orange-400' };
      return { text: 'Keep Learning', color: 'text-red-400' };
    };

    const performance = getPerformanceLabel();

    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <CircularProgress
                value={scorePercent}
                size={120}
                strokeWidth={10}
                progressColor={getProgressColor()}
              >
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getScoreColor()}`}>
                    {scorePercent}%
                  </p>
                </div>
              </CircularProgress>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">Assessment Complete!</h1>
              <p className={`text-2xl font-semibold mb-3 ${performance.color}`}>
                {performance.text}
              </p>
              <p className="text-lg text-neutral-400 mb-4">{assessment.domain}</p>
              
              <p className="text-base text-neutral-300">
                You scored <span className="font-semibold text-white">{result.correctCount}</span> out of{' '}
                <span className="font-semibold text-white">{result.totalQuestions}</span> questions correctly
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-5">Results Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-400" />
                <span className="text-base text-neutral-300">Correct</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold">{result.correctCount} ({Math.round((result.correctCount / result.totalQuestions) * 100)}%)</span>
                <div className="w-52 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(result.correctCount / result.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-red-400" />
                <span className="text-base text-neutral-300">Incorrect</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold">{incorrectCount} ({Math.round((incorrectCount / result.totalQuestions) * 100)}%)</span>
                <div className="w-52 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(incorrectCount / result.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {result.summary && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-5">Summary of your Assessment</h2>
            <div className="space-y-6">
              {result.summary.overallAssessment && (
                <p className="text-base text-neutral-300 leading-relaxed">
                  {result.summary.overallAssessment}
                </p>
              )}

              {result.summary.strengths && result.summary.strengths.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="size-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.summary.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-neutral-300">
                        <CheckCircle2 className="size-4 text-neutral-400 mt-1 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.summary.weaknesses && result.summary.weaknesses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="size-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Weaknesses</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.summary.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-neutral-300">
                        <XCircle className="size-4 text-neutral-400 mt-1 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.summary.topicsToReview && result.summary.topicsToReview.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="size-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Topics to Review</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.summary.topicsToReview.map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-neutral-300">
                        <BookOpen className="size-4 text-neutral-400 mt-1 flex-shrink-0" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.summary.studyRecommendations && result.summary.studyRecommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="size-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Study Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.summary.studyRecommendations.map((recommendation, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-neutral-300">
                        <span className="flex-shrink-0 size-6 pt-0.5 rounded-full bg-neutral-700 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {result.suggestedRoadmaps && result.suggestedRoadmaps.length > 0 && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Suggested Roadmaps</h2>
              <p className="text-sm text-neutral-400">
                Explore these roadmaps to improve your understanding
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.suggestedRoadmaps.map((roadmap, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(`/roadmap?topic=${encodeURIComponent(roadmap.topic)}&from=assessment`);
                  }}
                  className="cursor-pointer flex items-start gap-4 p-5 bg-neutral-800/50 border border-neutral-700 rounded-xl hover:border-neutral-500 hover:bg-neutral-800 transition-all text-left group"
                >
                  <div className="flex-shrink-0 size-10 rounded-lg bg-neutral-700 flex items-center justify-center">
                    <BookOpen className="size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-white group-hover:text-neutral-300 transition-colors">
                      {roadmap.topic}
                    </h4>
                  </div>
                  <ExternalLink className="size-4 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Question Breakdown</h2>
          <div className="max-h-[500px] overflow-y-auto pr-2 space-y-5 custom-scrollbar">
            {result.questionBreakdown.map((q, index) => (
              <div 
                key={q.questionId}
                className={`p-6 rounded-xl border ${
                  q.isCorrect 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <p className="text-lg font-medium">
                    <span className="text-neutral-500 mr-2">Q{index + 1}.</span>
                    {q.questionText}
                  </p>
                  {q.isCorrect ? (
                    <CheckCircle2 className="size-6 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="size-6 text-red-400 flex-shrink-0" />
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, optIndex) => (
                    <div 
                      key={optIndex}
                      className={`text-base px-4 py-2.5 rounded-lg ${
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
                  <div className="mt-4 pt-4 border-t border-neutral-800">
                    <p className="text-base text-neutral-400">
                      <span className="text-neutral-300 font-medium">Explanation: </span>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => router.push('/assessment')}
            className="!h-14 !text-[1.2rem]"
          >
            Try Again
            <RotateCcw className="size-5" />
          </Button>
          <Button 
            size="lg"
            onClick={() => router.push('/history')}
            className="!h-14 !text-[1.2rem]"
          >
            View All History
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <p className="text-center text-base text-neutral-500 mt-8">
          AI can make mistakes, make sure to verify important information
        </p>
      </div>
    );
  }

  if (assessment.status === 'pending') {
    return (
      <div className="w-[58rem] mx-auto py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-24 rounded-full bg-neutral-900/50 border border-neutral-800 mb-8">
            <Sparkles className="size-12 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold mb-5">{assessment.domain}</h1>
          
          <div className="flex items-center justify-center gap-3 mb-10">
            <Badge variant="outline" className={`capitalize text-base px-4 py-1.5 ${getDifficultyColor(assessment.difficulty)}`}>
              {assessment.difficulty}
            </Badge>
            <Badge variant="outline" className="capitalize text-base px-4 py-1.5 border-neutral-700 text-neutral-300">
              {assessment.questionCount} questions
            </Badge>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-10 mb-10">
            <h2 className="text-2xl font-semibold mb-6">Before you begin</h2>
            <ul className="text-left space-y-4 text-neutral-400 max-w-lg mx-auto">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-lg">Read each question carefully before selecting an answer</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-lg">You can navigate between questions using the arrows</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-lg">Click &quot;Check Answer&quot; to submit your response</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-lg">Complete all questions to see your final results</span>
              </li>
            </ul>
          </div>

          <Button 
            size="lg"
            onClick={handleStartAssessment}
            disabled={loadingStates.starting}
            className="!h-14 !px-12 !text-[1.2rem]"
          >
            {loadingStates.starting ? (
              <>
                Starting...
                <Loader2 className="size-5.5 animate-spin" />
              </>
            ) : (
              <>
                Start Assessment
                <ChevronRight className="size-5.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[58rem] mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="size-12"
          >
            <ChevronLeft className="size-6" />
          </Button>
          <span className="text-xl font-medium">
            Question <span className="text-white">{currentQuestionIndex + 1}</span> of {assessment.questionCount}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex >= assessment.questionCount - 1}
            className="size-12"
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-lg text-neutral-400">{Math.round(progressPercent)}% complete</span>
          <Badge variant="outline" className={`capitalize text-base px-3 py-1 ${getDifficultyColor(assessment.difficulty)}`}>
            {assessment.difficulty}
          </Badge>
        </div>
      </div>

      <Progress value={progressPercent} className="h-2.5 mb-10" />

      {currentQuestion && (
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-10 mb-8">
          <h2 className="text-[1.75rem] font-bold mb-10 leading-relaxed">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-5">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={currentAnswer?.isSubmitted}
                className={getOptionStyle(index)}
              >
                <div className={`
                  size-8 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${!currentAnswer?.isSubmitted && selectedOption === index
                    ? 'border-white bg-white'
                    : ''
                  }
                  ${!currentAnswer?.isSubmitted && selectedOption !== index
                    ? 'border-neutral-600'
                    : ''
                  }
                  ${currentAnswer?.isSubmitted && currentAnswer.selectedIndex === index && currentAnswer.isCorrect
                    ? 'border-green-500 bg-green-500'
                    : ''
                  }
                  ${currentAnswer?.isSubmitted && currentAnswer.selectedIndex === index && !currentAnswer.isCorrect
                    ? 'border-red-500 bg-red-500'
                    : ''
                  }
                  ${currentAnswer?.isSubmitted && currentAnswer.selectedIndex !== index
                    ? 'border-neutral-700'
                    : ''
                  }
                `}>
                  {currentAnswer?.isSubmitted && currentAnswer.selectedIndex === index ? (
                    currentAnswer.isCorrect ? (
                      <Check className="size-5 text-white" />
                    ) : (
                      <X className="size-5 text-white" />
                    )
                  ) : (
                    !currentAnswer?.isSubmitted && selectedOption === index && (
                      <div className="size-3 rounded-full bg-neutral-900" />
                    )
                  )}
                </div>
                <span className="text-[1.15rem]">{option}</span>
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
          disabled={currentQuestionIndex >= assessment.questionCount - 1 || loadingStates.submitting}
          className="!h-14 !text-[1.2rem]"
        >
          Skip Question
        </Button>

        <div className="flex items-center gap-4">
          {!currentAnswer?.isSubmitted ? (
            <Button 
              size="lg"
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || loadingStates.submitting}
              className="!h-14 !text-[1.2rem]"
            >
              {loadingStates.submitting ? (
                <>
                  Checking...
                  <Loader2 className="size-5 animate-spin" />
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
                className="!h-14 !text-[1.2rem]"
              >
                Next Question
                <ChevronRight className="size-5" />
              </Button>
            )
          )}

          {isAllAnswered && (
            <Button 
              size="lg"
              variant="outline"
              onClick={handleCompleteAssessment}
              disabled={loadingStates.completing}
              className="!h-14 !text-[1.2rem] !border-green-500/50 text-green-400 hover:text-green-400 hover:bg-green-500/10"
            >
              {loadingStates.completing ? (
                <>
                  Completing...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                <>
                  Complete Assessment
                  <Trophy className="size-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-[1.2rem] text-neutral-500 mt-12">
        AI can make mistakes, make sure to verify important information
      </p>
    </div>
  );
}

