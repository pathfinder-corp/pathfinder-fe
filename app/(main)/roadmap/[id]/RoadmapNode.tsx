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

function RoadmapNode({ data, id }: NodeProps<any>) {
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
      <Handle
        type="target"
        position={Position.Top}
        className="border-neutral-500! bg-neutral-600!"
      />

      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'rounded-2xl border-2 p-6 backdrop-blur-sm transition-all duration-300',
                'w-[380px] max-w-[380px]',
                config.bg,
                'cursor-pointer hover:scale-[1.03] hover:shadow-2xl'
              )}
              data-driver={`roadmap-node-${id || 'unknown'}`}
            >
              <div className="flex items-start gap-4">
                <div className={cn('mt-1 shrink-0', config.textColor)}>
                  <BookOpenCheck className="size-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="mb-3 line-clamp-2 text-[1.75rem] leading-tight font-bold">
                    {label}
                  </h3>

                  <p className="mb-3 line-clamp-2 text-xl leading-7 text-neutral-400">
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
            className="max-w-md border-neutral-700 bg-[#272727] p-6"
          >
            <div className="space-y-3">
              <h4 className="text-2xl font-bold text-white">{label}</h4>
              <p className="text-xl leading-relaxed text-neutral-300">
                {description}
              </p>
              <div className="flex items-center gap-2 border-t border-neutral-700 pt-3 text-xl text-neutral-400">
                <Clock className="size-6" />
                <span>{duration}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Handle
        type="source"
        position={Position.Bottom}
        className="border-neutral-500! bg-neutral-600!"
      />
    </>
  );
}

export default memo(RoadmapNode);
