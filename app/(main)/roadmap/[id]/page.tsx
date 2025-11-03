'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Calendar, Zap, ChevronDown, Maximize2, X, ExternalLink, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { IRoadmapResponse } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { roadmapService } from '@/services/roadmap.service';
import { convertRoadmapToFlow } from '@/lib';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = params.id as string;

  const [roadmap, setRoadmap] = useState<IRoadmapResponse | null>(null);
  const [nodes, setNodes] = useState<Node<any>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  
  const [selectedNode, setSelectedNode] = useState<INodeDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setIsLoading(true);
        const data = await roadmapService.getRoadmap(roadmapId);
        setRoadmap(data);

        const { nodes: flowNodes, edges: flowEdges } = convertRoadmapToFlow(data);
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể tải lộ trình');
        router.push('/roadmap');
      } finally {
        setIsLoading(false);
      }
    };

    if (roadmapId) {
      fetchRoadmap();
    }
  }, [roadmapId, router]);

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
        });
        setIsDetailOpen(true);
      }
    }
  };

  if (isLoading) return <DetailLoading />;

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
          <h2 className="text-xl font-semibold">Learning roadmap</h2>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="!w-[2rem]">
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
              <RoadmapFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="h-screen">
        <RoadmapFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />
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
                <div className="flex-shrink-0 size-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-base">
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

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[600px] sm:max-w-[600px] p-6"
        >
          {selectedNode && (
            <>
              <SheetHeader className="border-b border-neutral-800 pl-0 pb-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <SheetTitle className="text-2xl font-bold mb-2">
                      {selectedNode.title}
                    </SheetTitle>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Clock className="size-4" />
                      <span className="text-base">{selectedNode.duration}</span>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-180px)] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Target className="size-5" />
                      {selectedNode.isPhase ? 'Expected Outcome' : 'Description'}
                    </h3>
                    <p className="text-base text-neutral-300 leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>

                  {!selectedNode.isPhase && selectedNode.keyActivities && selectedNode.keyActivities.length > 0 && (
                    <div className="border-t border-neutral-800 pt-6">
                      <h3 className="text-lg font-semibold mb-3">
                        Key Activities
                      </h3>
                      <ul className="space-y-3">
                        {selectedNode.keyActivities.map((activity, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="flex-shrink-0 size-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold mt-0.5">
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
                      <h3 className="text-lg font-semibold mb-4">
                        Academic Resources
                      </h3>
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
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}