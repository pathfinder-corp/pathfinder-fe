'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import RoadmapNode from './RoadmapNode';

const nodeTypes = {
  roadmapNode: RoadmapNode,
} as NodeTypes;

interface RoadmapFlowProps {
  nodes: Node<any>[];
  edges: Edge[];
  resetTrigger?: number;
  onNodeClick?: (nodeId: string) => void;
}

function RoadmapFlowInner({ nodes: initialNodes, edges: initialEdges, resetTrigger, onNodeClick }: RoadmapFlowProps) {
  const [nodes, _setNodes, onNodesChange] = useNodesState<Node<any>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const { setCenter } = useReactFlow();

  const getViewportBounds = useCallback((): [[number, number], [number, number]] => {
    if (nodes.length === 0) {
      return [[-500, -500], [1500, 2000]];
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      const nodeWidth = 380;
      const nodeHeight = 180;

      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    const padding = 400;
    return [
      [minX - padding, minY - padding],
      [maxX + padding, maxY + padding]
    ];
  }, [nodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  const centerToStartNode = useCallback(() => {
    const startNode = nodes.find(node => node.id === 'start');
    if (startNode && startNode.position) {
      setCenter(
        startNode.position.x + 190, 
        startNode.position.y + 320, 
        { 
          zoom: 1,
          duration: 800
        }
      );
    }
  }, [nodes, setCenter]);

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        centerToStartNode();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      centerToStartNode();
    }
  }, [resetTrigger, centerToStartNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView={false}
      fitViewOptions={{
        padding: 0.2,
        maxZoom: 1,
        minZoom: 0.65,
      }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      panOnDrag={true}
      zoomOnScroll={true}
      minZoom={0.65}
      maxZoom={1.5}
      translateExtent={getViewportBounds()}
    >
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={20} 
        size={1}
        color="#606060"
      />
      </ReactFlow>
  );
}

export default function RoadmapFlow(props: RoadmapFlowProps) {
  return (
    <ReactFlowProvider>
      <RoadmapFlowInner {...props} />
    </ReactFlowProvider>
  );
}