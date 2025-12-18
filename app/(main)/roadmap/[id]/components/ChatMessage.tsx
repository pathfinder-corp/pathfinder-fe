'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import type { IChatMessage } from '../types';

interface IChatMessageProps {
  message: IChatMessage;
}

export function ChatMessage({ message }: IChatMessageProps) {
  return (
    <div
      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <div className="flex-shrink-0 size-10 rounded-full bg-white flex items-center justify-center mt-1">
          <Bot className="size-6 text-black" />
        </div>
      )}
      
      <div
        className={`max-w-[75%] rounded-lg p-5 ${
          message.role === 'user'
            ? 'bg-white text-black'
            : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
        }`}
      >
        {message.role === 'assistant' ? (
          <div className="prose prose-invert prose-base max-w-none [&_p]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_ul]:space-y-1 [&_strong]:text-white [&_strong]:font-bold">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-4 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-3 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-2 mb-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-base" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-3 space-y-1.5 text-base" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-3 space-y-1.5 text-base" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed text-base" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                code: ({node, inline, ...props}: any) => 
                  inline ? (
                    <code className="bg-neutral-800 px-2 py-1 rounded text-base" {...props} />
                  ) : (
                    <code className="block bg-neutral-800 p-3 rounded text-base overflow-x-auto" {...props} />
                  ),
                a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
      
      {message.role === 'user' && (
        <div className="flex-shrink-0 size-10 rounded-full bg-neutral-800 flex items-center justify-center mt-1">
          <User className="size-6 text-white" />
        </div>
      )}
    </div>
  );
}

