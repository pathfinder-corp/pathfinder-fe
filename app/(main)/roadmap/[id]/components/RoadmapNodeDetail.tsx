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
          <h3 className="text-2xl font-semibold mb-3">
            {node.isPhase ? 'Expected Outcome' : 'Description'}
          </h3>
          <p className="text-xl text-neutral-300 leading-relaxed">
            {node.description}
          </p>
        </div>

        {!node.isPhase && node.keyActivities && node.keyActivities.length > 0 && (
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="text-2xl font-semibold mb-4">Key Activities</h3>
            <ul className="space-y-4">
              {node.keyActivities.map((activity, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="shrink-0 size-8 rounded-full bg-white text-black flex items-center justify-center text-lg font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xl text-neutral-300 leading-relaxed">
                    {activity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!node.isPhase && node.resources && node.resources.length > 0 && (
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="text-2xl font-semibold mb-4">Academic Resources</h3>
            <div className="space-y-4">
              {node.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:bg-neutral-900 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-base font-semibold px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded">
                          {resource.type.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xl font-semibold text-white group-hover:text-neutral-200 transition-colors">
                        {resource.title}
                      </h4>
                    </div>
                    <ExternalLink className="size-6 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
                  </div>
                  <p className="text-lg text-neutral-400 leading-relaxed">
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