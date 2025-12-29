'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Zap,
  Maximize2,
  Clock,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { IRoadmapResponse, IProgressResponse } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { roadmapService } from '@/services';
import { convertRoadmapToFlow, extractTitle } from '@/lib';
import { useRoadmapStore, useUserStore } from '@/stores';
import { useTour, type TourStep } from '@/hooks';
import type { INodeDetail, IChatMessage, LoadingStates } from './types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoadmapFlow from './RoadmapFlow';
import DetailLoading from './loading';
import {
  AIChatInterface,
  RoadmapNodeDetail,
  ShareRoadmapDialog,
} from './components';

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUserStore();
  const { setIsViewMode, reset: resetRoadmapStore } = useRoadmapStore();
  const { startTour } = useTour('roadmap-tour-completed', user?.id);
  const roadmapId = params.id as string;

  const [roadmap, setRoadmap] = useState<IRoadmapResponse | null>(null);
  const [nodes, setNodes] = useState<Node<any>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    aiChat: false,
  });
  const [selectedNode, setSelectedNode] = useState<INodeDetail | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [isChatMode, setIsChatMode] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
  const [chatHistoryByNode, setChatHistoryByNode] = useState<
    Record<string, IChatMessage[]>
  >({});
  const [chatInput, setChatInput] = useState<string>('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);

  const updateLoadingState = useCallback(
    (key: keyof LoadingStates, value: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        updateLoadingState('initial', true);
        const roadmapData = await roadmapService.getRoadmap(roadmapId);
        setRoadmap(roadmapData);

        const isOwner =
          user && roadmapData.owner?.id
            ? roadmapData.owner.id === user.id
            : roadmapData.accessType === 'owner';
        setIsViewMode(!isOwner);

        const { nodes: flowNodes, edges: flowEdges } =
          convertRoadmapToFlow(roadmapData);
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Cannot load roadmap';
        toast.error('Cannot load roadmap', {
          description: errorMessage,
        });
        router.push('/roadmap');
      } finally {
        updateLoadingState('initial', false);
      }
    };

    if (roadmapId) {
      fetchRoadmap();
    }

    return () => {
      resetRoadmapStore();
    };
  }, [
    roadmapId,
    router,
    updateLoadingState,
    setIsViewMode,
    resetRoadmapStore,
    user,
  ]);

  const isViewer =
    user && roadmap?.owner?.id
      ? roadmap.owner.id !== user.id
      : roadmap?.accessType === 'shared' || roadmap?.accessType === 'public';

  const handleNodeClick = (nodeId: string) => {
    if (!roadmap) return;

    const [type, phaseIdx, stepIdx] = nodeId.split('-');

    if (type === 'start') return;

    const phaseIndex = parseInt(phaseIdx);

    if (type === 'phase') {
      const phase = roadmap.phases[phaseIndex];
      if (phase) {
        setSelectedNode({
          title: phase.title,
          description: phase.description || phase.outcome,
          duration: phase.estimatedDuration,
          outcome: phase.outcome,
          objectives: phase.objectives,
          keySkills: phase.keySkills,
          prerequisites: phase.prerequisites,
          isPhase: true,
          phaseTitle: phase.title,
        });
        setSelectedNodeId(nodeId);
        setIsDetailOpen(true);
      }
    } else if (type === 'step') {
      const stepIndex = parseInt(stepIdx);
      const phase = roadmap.phases[phaseIndex];
      const step = phase?.steps?.[stepIndex];

      if (step) {
        setSelectedNode({
          title: step.title,
          description: step.description,
          duration: step.estimatedDuration,
          keyActivities: step.keyActivities,
          resources: step.resources,
          isPhase: false,
          phaseTitle: phase.title,
        });
        setSelectedNodeId(nodeId);
        setIsDetailOpen(true);
      }
    }
  };

  const handleAskAI = () => {
    setIsChatMode(true);

    if (
      selectedNodeId &&
      (!chatHistoryByNode[selectedNodeId] ||
        chatHistoryByNode[selectedNodeId].length === 0) &&
      selectedNode
    ) {
      const suggestedQuestion = selectedNode.isPhase
        ? `Can you explain the "${extractTitle(selectedNode.title)}" phase in more detail?`
        : `What are the key activities I should focus on in "${extractTitle(selectedNode.title)}"?`;
      setChatInput(suggestedQuestion);
    }
  };

  const handleBackToDetail = () => {
    setIsChatMode(false);
  };

  const handleSendMessage = async () => {
    if (
      !chatInput.trim() ||
      loadingStates.aiChat ||
      !selectedNode ||
      !selectedNodeId
    )
      return;

    const userMessage: IChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatHistoryByNode((prev) => ({
      ...prev,
      [selectedNodeId]: [...(prev[selectedNodeId] || []), userMessage],
    }));

    setChatInput('');
    updateLoadingState('aiChat', true);

    try {
      const requestBody: {
        question: string;
        phaseTitle: string;
        stepTitle: string;
      } = {
        question: userMessage.content,
        phaseTitle: '',
        stepTitle: '',
      };

      const extractedTitle = extractTitle(selectedNode.title).trim();
      const finalTitle = extractedTitle || selectedNode.title.trim();

      if (selectedNode.isPhase) {
        requestBody.phaseTitle = finalTitle;
      } else {
        requestBody.stepTitle = finalTitle;
      }

      if (!requestBody.phaseTitle && !requestBody.stepTitle) {
        toast.error('Please select a phase/step to ask AI.');
        updateLoadingState('aiChat', false);
        return;
      }

      const response = await roadmapService.askInsight(roadmapId, requestBody);
      const aiMessage: IChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };

      setChatHistoryByNode((prev) => ({
        ...prev,
        [selectedNodeId]: [...(prev[selectedNodeId] || []), aiMessage],
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get AI response. Please try again.';
      toast.error('Failed to get AI response. Please try again.', {
        description: errorMessage,
      });
    } finally {
      updateLoadingState('aiChat', false);
    }
  };

  const handleClearChat = () => {
    if (!selectedNodeId) return;

    setChatHistoryByNode((prev) => ({
      ...prev,
      [selectedNodeId]: [],
    }));
    setChatInput('');
  };

  const getSuggestedQuestions = () => {
    if (!selectedNode) return [];

    const cleanTitle = extractTitle(selectedNode.title);

    if (selectedNode.isPhase) {
      return [
        `What specific skills and competencies will I develop during the "${cleanTitle}" phase?`,
        `What are the key learning objectives I should focus on in "${cleanTitle}"?`,
        `How should I measure my progress and success in the "${cleanTitle}" phase?`,
      ];
    } else {
      return [
        `What are the essential learning outcomes from completing "${cleanTitle}"?`,
        `What practical skills will I master by finishing "${cleanTitle}"?`,
        `How does "${cleanTitle}" help me build proficiency in this subject?`,
      ];
    }
  };

  const handleResetView = () => setResetTrigger((prev) => prev + 1);

  useEffect(() => {
    if (loadingStates.initial || !roadmap || nodes.length === 0) return;

    const shouldStartTour =
      sessionStorage.getItem('start-roadmap-tour') === 'true';
    if (!shouldStartTour) return;

    sessionStorage.removeItem('start-roadmap-tour');

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
        const flowContainer = await waitForElement(
          '[data-driver="roadmap-flow-container"]'
        );
        const shareButton = await waitForElement(
          '[data-driver="share-roadmap-button"]'
        );
        const resetButton = await waitForElement(
          '[data-driver="reset-view-button"]'
        );
        const maximizeButton = await waitForElement(
          '[data-driver="maximize-button"]'
        );
        const summarySection = await waitForElement(
          '[data-driver="roadmap-summary"]'
        );
        const milestonesSection = await waitForElement(
          '[data-driver="roadmap-milestones"]'
        );

        if (!flowContainer) {
          console.warn('Roadmap flow container not found, skipping tour');
          return;
        }

        const firstPhaseNode = nodes.find((node) =>
          node.id.startsWith('phase-')
        );
        const firstStepNode = nodes.find((node) => node.id.startsWith('step-'));
        const targetNode = firstStepNode || firstPhaseNode;

        let targetNodeElement = null;
        if (targetNode) {
          targetNodeElement = await waitForElement(
            `[data-driver="roadmap-node-${targetNode.id}"]`,
            30,
            200
          );
        }

        const tourSteps: TourStep[] = [
          {
            element: '[data-driver="roadmap-flow-container"]',
            popover: {
              title: 'Welcome to Your Learning Roadmap!',
              description:
                'This is your personalized learning roadmap. You can pan around by dragging and zoom with your mouse wheel.',
              side: 'bottom',
              align: 'center',
            },
          },
        ];

        if (summarySection) {
          tourSteps.push({
            element: '[data-driver="roadmap-summary"]',
            popover: {
              title: 'Roadmap Summary',
              description:
                'Click here to view the recommended cadence, duration, and success tips for this learning roadmap.',
              side: 'bottom',
              align: 'center',
            },
          });
        }

        if (shareButton) {
          tourSteps.push({
            element: '[data-driver="share-roadmap-button"]',
            popover: {
              title: 'Share Your Roadmap',
              description:
                'Click here to share your roadmap with others or make it public.',
              side: 'left',
              align: 'center',
            },
          });
        }

        if (resetButton) {
          tourSteps.push({
            element: '[data-driver="reset-view-button"]',
            popover: {
              title: 'Reset View',
              description:
                'Click this button to reset the roadmap view to its initial position and zoom level.',
              side: 'bottom',
              align: 'center',
            },
          });
        }

        if (maximizeButton) {
          tourSteps.push({
            element: '[data-driver="maximize-button"]',
            popover: {
              title: 'Maximize View',
              description:
                'Click this button to open the roadmap in a full-screen view for better navigation.',
              side: 'bottom',
              align: 'center',
            },
          });
        }

        if (targetNode && targetNodeElement) {
          tourSteps.push({
            element: `[data-driver="roadmap-node-${targetNode.id}"]`,
            popover: {
              title: 'Explore Learning Steps',
              description:
                'Click on any node (phase or step) to see detailed information, resources, and activities.',
              side: 'right',
              align: 'center',
            },
          });
        }

        if (milestonesSection) {
          tourSteps.push({
            element: '[data-driver="roadmap-milestones"]',
            popover: {
              title: 'Important Milestones',
              description:
                'Review the key milestones and success criteria to track your progress throughout the learning journey.',
              side: 'top',
              align: 'center',
            },
          });
        }

        setTimeout(() => {
          startTour(tourSteps);
        }, 300);
      } catch (error) {
        console.error('Error starting tour:', error);
      }
    };

    startTourWhenReady();
  }, [loadingStates.initial, roadmap, nodes, startTour]);

  if (loadingStates.initial) return <DetailLoading />;
  if (!roadmap) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h1 className="text-5xl font-bold">{roadmap.topic}</h1>
            {isViewer && (
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                View Only
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-6 text-neutral-400">
            <div className="flex items-center gap-2">
              <Zap className="size-7" />
              <span className="text-xl capitalize">
                {roadmap.learningPace || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-7" />
              <span className="text-xl">{roadmap.timeframe || 'N/A'}</span>
            </div>
          </div>
        </div>

        {!isViewer && (
          <Button
            variant="outline"
            size="lg"
            className="flex h-14! items-center gap-2 text-lg!"
            onClick={() => setIsShareDialogOpen(true)}
            data-driver="share-roadmap-button"
          >
            Share
            <Share2 className="size-5" />
          </Button>
        )}
      </div>
      {roadmap.summary && (
        <Accordion
          type="single"
          collapsible
          className="rounded-lg border border-neutral-800 bg-neutral-900/50"
          data-driver="roadmap-summary"
        >
          <AccordionItem value="summary" className="border-0">
            <AccordionTrigger className="px-6 pt-6 pb-6 hover:no-underline">
              <h2 className="text-3xl font-semibold">Summary</h2>
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 text-xl text-neutral-300">
                <p>
                  <strong>Recommended Cadence:</strong>{' '}
                  {roadmap.summary.recommendedCadence}
                </p>
                <p>
                  <strong>Recommended Duration:</strong>{' '}
                  {roadmap.summary.recommendedDuration}
                </p>
                {roadmap.summary.additionalNotes && (
                  <p>
                    <strong>Additional Notes:</strong>{' '}
                    {roadmap.summary.additionalNotes}
                  </p>
                )}
              </div>

              {roadmap.summary.successTips &&
                roadmap.summary.successTips.length > 0 && (
                  <div className="mt-4">
                    <strong className="mb-2 block text-xl text-neutral-300">
                      Success Tips:
                    </strong>
                    <ul className="list-inside list-disc space-y-2 text-xl text-neutral-300">
                      {roadmap.summary.successTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div className="space-y-6">
        <div
            className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50"
            data-driver="roadmap-flow-container"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 p-5">
              <h2 className="text-3xl font-semibold">Learning Roadmap</h2>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10!"
                  onClick={handleResetView}
                  title="Reset view to initial position"
                  data-driver="reset-view-button"
                >
                  <RotateCcw className="size-5" />
                </Button>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10!"
                      data-driver="maximize-button"
                    >
                      <Maximize2 className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[95vh] w-full">
                    <SheetHeader>
                      <SheetTitle className="text-3xl">{roadmap.topic}</SheetTitle>
                      <SheetDescription className="text-xl">
                        Detailed learning roadmap - Move with mouse, zoom with
                        scroll
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 h-[calc(95vh-120px)]">
                      <RoadmapFlow
                        nodes={nodes}
                        edges={edges}
                        onNodeClick={handleNodeClick}
                        resetTrigger={resetTrigger}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="h-screen">
              <RoadmapFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
                resetTrigger={resetTrigger}
              />
            </div>
          </div>

          {roadmap.milestones && roadmap.milestones.length > 0 && (
            <div
              className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-7"
              data-driver="roadmap-milestones"
            >
              <h2 className="mb-5 text-3xl font-semibold">Important Milestones</h2>
              <div className="grid gap-4">
                {roadmap.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg border border-neutral-700 bg-neutral-800/50 p-5"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-black">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-2xl font-semibold">
                        {milestone.title}
                      </h3>
                      <p className="text-xl text-neutral-400">
                        {milestone.successCriteria}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      <Sheet
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setIsChatMode(false);
            setChatInput('');
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full p-0 sm:w-150 sm:max-w-150"
          showClose={false}
        >
          {selectedNode && (
            <>
              <SheetHeader className="border-b border-neutral-800 p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {isChatMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToDetail}
                        className="mb-2 -ml-2 h-10! text-base!"
                      >
                        <ArrowLeft className="mr-2 size-5" />
                        Back to details
                      </Button>
                    )}
                    <SheetTitle className="mb-2 text-3xl font-bold">
                      {isChatMode ? 'Ask AI Assistant' : selectedNode.title}
                    </SheetTitle>
                    {!isChatMode && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Clock className="size-6" />
                        <span className="text-xl">{selectedNode.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isChatMode && chatMessages.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearChat}
                        disabled={loadingStates.aiChat}
                        className="h-10! text-base!"
                      >
                        Clear Chat
                      </Button>
                    )}

                    {!isChatMode && (
                      <Button
                        onClick={handleAskAI}
                        size="lg"
                        className="flex h-12! items-center gap-2 border-0 bg-linear-to-r from-purple-600 to-blue-600 text-lg! text-white hover:from-purple-700 hover:to-blue-700"
                      >
                        Ask AI
                        <Sparkles className="size-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </SheetHeader>
              {!isChatMode ? (
                <RoadmapNodeDetail node={selectedNode} />
              ) : (
                <AIChatInterface
                  chatMessages={
                    selectedNodeId
                      ? chatHistoryByNode[selectedNodeId] || []
                      : []
                  } // ✅ Pass messages của node hiện tại
                  chatInput={chatInput}
                  isLoading={loadingStates.aiChat}
                  suggestedQuestions={getSuggestedQuestions()}
                  onInputChange={setChatInput}
                  onSendMessage={handleSendMessage}
                  onSuggestedQuestionClick={setChatInput}
                />
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <ShareRoadmapDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        roadmapId={roadmapId}
        roadmapTitle={roadmap.topic}
      />
    </div>
  );
}
