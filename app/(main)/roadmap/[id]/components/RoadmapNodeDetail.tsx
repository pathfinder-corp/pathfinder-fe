'use client';

import { ExternalLink } from 'lucide-react';
import type { INodeDetail } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IRoadmapNodeDetailProps {
  node: INodeDetail;
}

export function RoadmapNodeDetail({ node }: IRoadmapNodeDetailProps) {
  return (
    <ScrollArea className="h-[calc(100vh-140px)] px-6">
      <div className="space-y-6 py-6">
        <div className="-mt-4">
          <h3 className="mb-3 text-2xl font-semibold">
            {node.isPhase ? 'Expected Outcome' : 'Description'}
          </h3>
          <p className="text-xl leading-relaxed text-neutral-300">
            {node.description}
          </p>
        </div>

        {!node.isPhase &&
          node.keyActivities &&
          node.keyActivities.length > 0 && (
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="mb-4 text-2xl font-semibold">Key Activities</h3>
              <ul className="space-y-4">
                {node.keyActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-black">
                      {idx + 1}
                    </span>
                    <span className="text-xl leading-relaxed text-neutral-300">
                      {activity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {!node.isPhase && node.resources && node.resources.length > 0 && (
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="mb-4 text-2xl font-semibold">Academic Resources</h3>
            <div className="space-y-4">
              {node.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-lg border border-neutral-800 bg-neutral-900/50 p-5 transition-all hover:border-neutral-700 hover:bg-neutral-900"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="rounded bg-neutral-800 px-3 py-1.5 text-base font-semibold text-neutral-300">
                          {resource.type.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xl font-semibold text-white transition-colors group-hover:text-neutral-200">
                        {resource.title}
                      </h4>
                    </div>
                    <ExternalLink className="size-6 shrink-0 text-neutral-500 transition-colors group-hover:text-white" />
                  </div>
                  <p className="text-lg leading-relaxed text-neutral-400">
                    {resource.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
