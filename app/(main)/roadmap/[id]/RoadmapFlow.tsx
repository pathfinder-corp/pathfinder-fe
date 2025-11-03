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
  onNodeClick?: (nodeId: string) => void;
}

function RoadmapFlowInner({ nodes: initialNodes, edges: initialEdges, onNodeClick }: RoadmapFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const { setCenter } = useReactFlow();

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

  useEffect(() => {
    if (nodes.length > 0) {
      const startNode = nodes[0];
      
      setTimeout(() => {
        setCenter(
          startNode.position.x + 135, 
          startNode.position.y + 180, 
          { 
            zoom: 0.8,
            duration: 800
          }
        );
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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