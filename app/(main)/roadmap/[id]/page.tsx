'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Zap, ChevronDown, Maximize2, ExternalLink, Clock, Sparkles, RotateCcw, Send, ArrowLeft, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; 
import type { IRoadmapResponse } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { roadmapService } from '@/services/roadmap.service';
import { convertRoadmapToFlow, extractTitle } from '@/lib';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TextShimmer } from '@/components/motion-primitives/text-shimmer';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import RoadmapFlow from './RoadmapFlow';
import DetailLoading from './loading';

interface INodeDetail {
  title: string;
  description: string;
  duration: string;
  outcome?: string;
  keyActivities?: string[];
  resources?: Array<{
    type: string;
    title: string;
    url: string;
    description: string;
  }>;
  isPhase: boolean;
  phaseTitle?: string;
}

interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type LoadingStates = {
  initial: boolean;
  aiChat: boolean;
};

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = params.id as string;

  const [roadmap, setRoadmap] = useState<IRoadmapResponse | null>(null);
  const [nodes, setNodes] = useState<Node<any>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    aiChat: false,
  });
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<INodeDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [isChatMode, setIsChatMode] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const updateLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        updateLoadingState('initial', true);
        const data = await roadmapService.getRoadmap(roadmapId);
        setRoadmap(data);

        const { nodes: flowNodes, edges: flowEdges } = convertRoadmapToFlow(data);
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể tải lộ trình');
        router.push('/roadmap');
      } finally {
        updateLoadingState('initial', false);
      }
    };

    if (roadmapId) {
      fetchRoadmap();
    }
  }, [roadmapId, router, updateLoadingState]);

  useEffect(() => {
    if (chatMessages.length > 0 || loadingStates.aiChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, loadingStates.aiChat]);

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
        setIsDetailOpen(true);
      }
    }
  };

  const handleAskAI = () => {
    setIsChatMode(true);
    
    if (chatMessages.length === 0 && selectedNode) {
      const suggestedQuestion = selectedNode.isPhase
        ? `Can you explain the "${selectedNode.title}" phase in more detail?`
        : `What are the key activities I should focus on in "${selectedNode.title}"?`;
      setChatInput(suggestedQuestion);
    }
  };

  const handleBackToDetail = () => {
    setIsChatMode(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || loadingStates.aiChat || !selectedNode) return;
  
    const userMessage: IChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };
  
    setChatMessages(prev => [...prev, userMessage]);
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
  
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.');
      console.error('AI insight error:', error);
    } finally {
      updateLoadingState('aiChat', false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
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
          <h1 className="text-5xl font-bold mb-3">{roadmap.topic}</h1>
          
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
      </div>

      {roadmap.summary && (
        <Collapsible
          open={isSummaryOpen}
          onOpenChange={setIsSummaryOpen}
          className="bg-neutral-900/50 border border-neutral-800 rounded-lg"
        >
          <div className="flex items-center justify-between p-6 pb-3">
            <h2 className="text-2xl font-semibold">Summary</h2>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="p-2 h-auto hover:bg-neutral-800"
              >
                <ChevronDown 
                  className={`size-5 transition-transform duration-200 ${
                    isSummaryOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="px-6 pb-6">
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
          </CollapsibleContent>
        </Collapsible>
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
          setChatMessages([]);
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
                <ScrollArea className="h-[calc(100vh-140px)] px-6">
                  <div className="space-y-6 py-6">
                    <div className="-mt-4">
                      <h3 className="text-lg font-semibold mb-1.5">
                        {selectedNode.isPhase ? 'Expected Outcome' : 'Description'}
                      </h3>
                      <p className="text-base text-neutral-300 leading-relaxed">
                        {selectedNode.description}
                      </p>
                    </div>

                    {!selectedNode.isPhase && selectedNode.keyActivities && selectedNode.keyActivities.length > 0 && (
                      <div className="border-t border-neutral-800 pt-6">
                        <h3 className="text-lg font-semibold mb-2">Key Activities</h3>
                        <ul className="space-y-3">
                          {selectedNode.keyActivities.map((activity, idx) => (
                            <li key={idx} className="flex items-center gap-3">
                              <span className="flex-shrink-0 size-6 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-base text-neutral-300 leading-relaxed">
                                {activity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!selectedNode.isPhase && selectedNode.resources && selectedNode.resources.length > 0 && (
                      <div className="border-t border-neutral-800 pt-6">
                        <h3 className="text-lg font-semibold mb-2">Academic Resources</h3>
                        <div className="space-y-4">
                          {selectedNode.resources.map((resource, idx) => (
                            <a
                              key={idx}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:bg-neutral-900 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <span className="text-xs font-semibold px-2 py-1 bg-neutral-800 text-neutral-300 rounded">
                                      {resource.type}
                                    </span>
                                  </div>
                                  <h4 className="text-base font-semibold text-white group-hover:text-neutral-200 transition-colors">
                                    {resource.title}
                                  </h4>
                                </div>
                                <ExternalLink className="size-5 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
                              </div>
                              <p className="text-sm text-neutral-400 leading-relaxed">
                                {resource.description}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col h-[calc(100vh-85px)]">
                  {chatMessages.length === 0 && (
                    <div className="-mt-4 p-6 border-b border-neutral-800 bg-neutral-900/30">
                      <p className="text-md text-neutral-400 mb-3">Suggested questions:</p>
                      <div className="space-y-2">
                        {getSuggestedQuestions().map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => setChatInput(question)}
                            className="cursor-pointer w-full text-left p-3 text-sm bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <ScrollArea className="h-[calc(100vh-165px)] p-6">
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex-shrink-0 size-8 rounded-full bg-white flex items-center justify-center mt-1">
                              <Bot className="size-5 text-black" />
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[75%] rounded-lg p-4 ${
                              message.role === 'user'
                                ? 'bg-white text-black'
                                : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                            }`}
                          >
                            {message.role === 'assistant' ? (
                              <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_ul]:space-y-1 [&_strong]:text-white [&_strong]:font-bold">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                                    em: ({node, ...props}) => <em className="italic" {...props} />,
                                    code: ({node, inline, ...props}: any) => 
                                      inline ? (
                                        <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-sm" {...props} />
                                      ) : (
                                        <code className="block bg-neutral-800 p-2 rounded text-sm overflow-x-auto" {...props} />
                                      ),
                                    a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-[.95rem] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                        </div>
                      ))}

                      {loadingStates.aiChat && (
                        <div className="flex gap-3 justify-start">
                          <div className="flex-shrink-0 size-8 rounded-full bg-white flex items-center justify-center mt-1">
                            <Bot className="size-5 text-black" />
                          </div>
                          <div className="max-w-[75%] rounded-lg p-4 bg-neutral-900 border border-neutral-800">
                            <TextShimmer
                              as="span"
                              className="text-[.95rem]"
                              duration={1}
                              spread={4}
                            >
                              AI is thinking...
                            </TextShimmer>
                          </div>
                        </div>
                      )}

                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>


                  <div className="p-6 border-t border-neutral-800 bg-neutral-900/30">
                    <div className="flex items-start gap-2 mb-3">
                      <Textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Ask a question about this step..."
                        rows={2}
                        className="flex-1 min-h-[3rem] max-h-[3rem] resize-none bg-neutral-900 border-neutral-800 !text-base"
                        disabled={loadingStates.aiChat}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || loadingStates.aiChat}
                        size="icon"
                        className="size-[3rem] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Send className="size-5 text-white" />
                      </Button>
                    </div>
                    <p className="text-md text-neutral-500 flex items-center gap-1.5">
                      Press <Kbd>Enter</Kbd> to send, <KbdGroup><Kbd>Shift</Kbd> + <Kbd>Enter</Kbd></KbdGroup> for new line
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}