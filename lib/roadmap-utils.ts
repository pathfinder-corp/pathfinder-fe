import type { Node, Edge } from '@xyflow/react';
import type { IRoadmapResponse } from '@/types';

export interface RoadmapNodeData {
  label: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'phase';
  duration: string;
  phaseIndex?: number;
  stepIndex?: number;
  resources?: Array<{ type: string; title: string; url: string; description: string }>;
  keyActivities?: string[];
}

export function convertRoadmapToFlow(roadmap: IRoadmapResponse): {
  nodes: Node<Record<string, any>>[];
  edges: Edge[];
} {
  const nodes: Node<Record<string, any>>[] = [];
  const edges: Edge[] = [];
  
  const centerX = 600;
  const phaseSpacing = 320;
  const stepOffsetX = 420;
  const stepLevelSpacing = 180;
  
  let currentY = 0;

  nodes.push({
    id: 'start',
    type: 'roadmapNode',
    position: { x: centerX, y: currentY },
    data: {
      label: `🎯 ${roadmap.topic}`,
      description: 'Start your learning journey',
      status: 'completed',
      duration: roadmap.timeframe || 'N/A',
    },
  });

  let prevPhaseId = 'start';
  currentY += phaseSpacing;

  roadmap.phases.forEach((phase, phaseIndex) => {
    const phaseNodeId = `phase-${phaseIndex}`;
    
    nodes.push({
      id: phaseNodeId,
      type: 'roadmapNode',
      position: { x: centerX, y: currentY },
      data: {
        label: phase.title,
        description: phase.outcome,
        status: 'phase',
        duration: phase.estimatedDuration,
        phaseIndex,
      },
    });

    edges.push({
      id: `e${prevPhaseId}-${phaseNodeId}`,
      source: prevPhaseId,
      target: phaseNodeId,
      animated: phaseIndex === 0,
      style: { 
        stroke: phaseIndex === 0 ? '#10b981' : '#6366f1', 
        strokeWidth: 2 
      },
    });

    if (phase.steps && phase.steps.length > 0) {
      let stepY = currentY + 220;

      for (let i = 0; i < phase.steps.length; i += 2) {
        const leftStep = phase.steps[i];
        const rightStep = phase.steps[i + 1];

        if (leftStep) {
          const leftStepId = `step-${phaseIndex}-${i}`;
          
          nodes.push({
            id: leftStepId,
            type: 'roadmapNode',
            position: { 
              x: centerX - stepOffsetX,
              y: stepY 
            },
            data: {
              label: leftStep.title,
              description: leftStep.description,
              status: 'pending',
              duration: leftStep.estimatedDuration,
              phaseIndex,
              stepIndex: i,
              resources: leftStep.resources,
              keyActivities: leftStep.keyActivities,
            },
          });

          edges.push({
            id: `e${phaseNodeId}-${leftStepId}`,
            source: phaseNodeId,
            target: leftStepId,
            animated: true,
            style: { 
              stroke: '#94a3b8', 
              strokeWidth: 1.5,
              strokeDasharray: '5,5'
            },
          });
        }

        if (rightStep) {
          const rightStepId = `step-${phaseIndex}-${i + 1}`;
          
          nodes.push({
            id: rightStepId,
            type: 'roadmapNode',
            position: { 
              x: centerX + stepOffsetX,
              y: stepY 
            },
            data: {
              label: rightStep.title,
              description: rightStep.description,
              status: 'pending',
              duration: rightStep.estimatedDuration,
              phaseIndex,
              stepIndex: i + 1,
              resources: rightStep.resources,
              keyActivities: rightStep.keyActivities,
            },
          });

          edges.push({
            id: `e${phaseNodeId}-${rightStepId}`,
            source: phaseNodeId,
            target: rightStepId,
            animated: true,
            style: { 
              stroke: '#94a3b8', 
              strokeWidth: 1.5,
              strokeDasharray: '5,5'
            },
          });
        }

        stepY += stepLevelSpacing;
      }

      const numStepPairs = Math.ceil(phase.steps.length / 2);
      currentY += phaseSpacing + (numStepPairs * stepLevelSpacing) - 50;
    } else {
      currentY += phaseSpacing;
    }

    prevPhaseId = phaseNodeId;
  });

  return { nodes, edges };
}