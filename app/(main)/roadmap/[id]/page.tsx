'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Eye, Calendar, Zap, Maximize2, Clock, RotateCcw, ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { IRoadmapResponse } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { roadmapService } from '@/services';
import { convertRoadmapToFlow, extractTitle } from '@/lib';
import { useRoadmapStore } from '@/stores';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import RoadmapFlow from './RoadmapFlow';
import DetailLoading from './loading';
import { AIChatInterface, RoadmapNodeDetail, ShareRoadmapDialog } from './components';
import type { INodeDetail, IChatMessage, LoadingStates } from './types';

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setIsViewMode, reset: resetRoadmapStore } = useRoadmapStore();
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
  const [chatHistoryByNode, setChatHistoryByNode] = useState<Record<string, IChatMessage[]>>({});
  const [chatInput, setChatInput] = useState<string>('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);

  const updateLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        updateLoadingState('initial', true);
        const data = await roadmapService.getRoadmap(roadmapId);
        setRoadmap(data);

        const isOwnerAccess = data.accessType === 'owner' || data.accessType === undefined;
        setIsViewMode(!isOwnerAccess);

        const { nodes: flowNodes, edges: flowEdges } = convertRoadmapToFlow(data);
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Cannot load roadmap');
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
  }, [roadmapId, router, updateLoadingState, setIsViewMode, resetRoadmapStore]);

  const isViewer = roadmap?.accessType === 'shared' || roadmap?.accessType === 'public';

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
          description: phase.outcome,
          duration: phase.estimatedDuration,
          outcome: phase.outcome,
          isPhase: true,
          phaseTitle: phase.title
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
          phaseTitle: phase.title
        });
        setSelectedNodeId(nodeId);
        setIsDetailOpen(true);
      }
    }
  };

  const handleAskAI = () => {
    setIsChatMode(true);
    
    if (selectedNodeId && (!chatHistoryByNode[selectedNodeId] || chatHistoryByNode[selectedNodeId].length === 0) && selectedNode) {
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
    if (!chatInput.trim() || loadingStates.aiChat || !selectedNode || !selectedNodeId) return;
  
    const userMessage: IChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };
  
    setChatHistoryByNode(prev => ({
      ...prev,
      [selectedNodeId]: [...(prev[selectedNodeId] || []), userMessage]
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
        timestamp: new Date()
      };
  
      setChatHistoryByNode(prev => ({
        ...prev,
        [selectedNodeId]: [...(prev[selectedNodeId] || []), aiMessage]
      }));
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.');
      console.error('AI insight error:', error);
    } finally {
      updateLoadingState('aiChat', false);
    }
  };

  const handleClearChat = () => {
    if (!selectedNodeId) return;
    
    setChatHistoryByNode(prev => ({
      ...prev,
      [selectedNodeId]: []
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

  const handleResetView = () => setResetTrigger(prev => prev + 1);

  if (loadingStates.initial) return <DetailLoading />;
  if (!roadmap) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-5xl font-bold">{roadmap.topic}</h1>
            {isViewer && (
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                <Eye className="size-3.5 mr-1.5" />
                View Only
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-neutral-400">
            <div className="flex items-center gap-2">
              <Zap className="size-5" />
              <span className="text-base capitalize">{roadmap.learningPace || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-5" />
              <span className="text-base">{roadmap.timeframe || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {!isViewer && (
          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-2 !h-12 !text-[1.1rem]"
            onClick={() => setIsShareDialogOpen(true)}
          >
            Share
            <Share2 className="size-4.5" />
          </Button>
        )}
      </div>
      {roadmap.summary && (
        <Accordion 
          type="single" 
          collapsible
          className="bg-neutral-900/50 border border-neutral-800 rounded-lg"
        >
          <AccordionItem value="summary" className="border-0">
            <AccordionTrigger className="px-6 pt-6 pb-3 hover:no-underline">
              <h2 className="text-2xl font-semibold">Summary</h2>
            </AccordionTrigger>
            
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 text-base text-neutral-300">
                <p>
                  <strong>Recommended cadence:</strong> {roadmap.summary.recommendedCadence}
                </p>
                <p>
                  <strong>Recommended duration:</strong> {roadmap.summary.recommendedDuration}
                </p>
                {roadmap.summary.additionalNotes && (
                  <p>
                    <strong>Additional notes:</strong> {roadmap.summary.additionalNotes}
                  </p>
                )}
              </div>

              {roadmap.summary.successTips && roadmap.summary.successTips.length > 0 && (
                <div className="mt-4">
                  <strong className="block mb-2 text-base">Success tips:</strong>
                  <ul className="list-disc list-inside space-y-2 text-base text-neutral-300">
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

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-xl font-semibold">Learning Roadmap</h2>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="!h-9"
              onClick={handleResetView}
              title="Reset view to initial position"
            >
              <RotateCcw className="size-4" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="!h-9">
                  <Maximize2 className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[95vh] w-full">
                <SheetHeader>
                  <SheetTitle className="text-2xl">{roadmap.topic}</SheetTitle>
                  <SheetDescription className="text-base">
                    Detailed learning roadmap - Move with mouse, zoom with scroll
                  </SheetDescription>
                </SheetHeader>
                <div className="h-[calc(95vh-120px)] mt-4">
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
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Important milestones</h2>
          <div className="grid gap-4">
            {roadmap.milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700"
              >
                <div className="flex-shrink-0 size-7 rounded-full bg-white flex items-center justify-center text-black font-bold text-[.9rem]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{milestone.title}</h3>
                  <p className="text-base text-neutral-400">{milestone.successCriteria}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Sheet open={isDetailOpen} onOpenChange={(open) => {
        setIsDetailOpen(open);
        if (!open) {
          setIsChatMode(false);
          setChatInput('');
        }
      }}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[600px] sm:max-w-[600px] p-0"
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
                        className="mb-2 -ml-2"
                      >
                        <ArrowLeft className="size-4 mr-2" />
                        Back to details
                      </Button>
                    )}
                    <SheetTitle className="text-2xl font-bold mb-2">
                      {isChatMode ? 'Ask AI Assistant' : selectedNode.title}
                    </SheetTitle>
                    {!isChatMode && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Clock className="size-4" />
                        <span className="text-base">{selectedNode.duration}</span>
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
                        className="text-sm"
                      >
                        Clear Chat
                      </Button>
                    )}
                    
                    {!isChatMode && (
                      <Button
                        onClick={handleAskAI}
                        size="lg"
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 !text-base"
                      >
                        Ask AI
                        <Sparkles className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </SheetHeader>
              {!isChatMode ? (
                <RoadmapNodeDetail 
                  node={selectedNode}
                />
              ) : (
                <AIChatInterface
                  chatMessages={selectedNodeId ? (chatHistoryByNode[selectedNodeId] || []) : []} // ✅ Pass messages của node hiện tại
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