'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BookOpenCheck, Clock } from 'lucide-react';
import { cn } from '@/lib';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface RoadmapNodeData {
  label: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'phase';
  duration: string;
}

function RoadmapNode({ data }: NodeProps<any>) {
  const { label, description, status, duration } = data;

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-500/10 border-green-500',
          icon: <BookOpenCheck className="size-5 text-green-500" />,
          textColor: 'text-green-500',
        };
      case 'in-progress':
        return {
          bg: 'bg-blue-500/10 border-blue-500',
          icon: <BookOpenCheck className="size-5 text-blue-500" />,
          textColor: 'text-blue-500',
        };
      case 'pending':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500',
          icon: <BookOpenCheck className="size-5 text-yellow-500" />,
          textColor: 'text-yellow-500',
        };
      case 'phase':
        return {
          bg: 'bg-blue-500/10 border-blue-500',
          icon: <BookOpenCheck className="size-5 text-blue-500" />,
          textColor: 'text-blue-500',
        };
      default:
        return {
          bg: 'bg-neutral-800 border-neutral-700',
          icon: <BookOpenCheck className="size-5 text-neutral-500" />,
          textColor: 'text-neutral-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <>
      <Handle type="target" position={Position.Top} className="bg-neutral-600! border-neutral-500!" />
      
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
              <div
              className={cn(
                'p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm',
                'w-[380px] max-w-[380px]',
                config.bg,
                'hover:scale-[1.03] cursor-pointer hover:shadow-2xl'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn('mt-1 shrink-0', config.textColor)}>
                  <BookOpenCheck className="size-7" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[1.75rem] leading-tight mb-3 line-clamp-2">
                    {label}
                  </h3>
                  
                  <p className="text-xl text-neutral-400 leading-7 mb-3 line-clamp-2">
                    {description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Clock className="size-6 shrink-0" />
                    <span className="truncate text-xl">{duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          
          <TooltipContent 
            side="right" 
            className="max-w-md p-6 bg-[#272727] border-neutral-700"
          >
            <div className="space-y-3">
              <h4 className="font-bold text-2xl text-white">{label}</h4>
              <p className="text-xl text-neutral-300 leading-relaxed">{description}</p>
              <div className="flex items-center gap-2 text-xl text-neutral-400 pt-3 border-t border-neutral-700">
                <Clock className="size-6" />
                <span>{duration}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Handle type="source" position={Position.Bottom} className="bg-neutral-600! border-neutral-500!" />
    </>
  );
}

export default memo(RoadmapNode);