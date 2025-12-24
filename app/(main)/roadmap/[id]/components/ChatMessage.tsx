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
        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
          <Bot className="size-6 text-black" />
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-lg p-5 ${
          message.role === 'user'
            ? 'bg-white text-black'
            : 'border border-neutral-800 bg-neutral-900 text-neutral-200'
        }`}
      >
        {message.role === 'assistant' ? (
          <div className="prose prose-invert prose-lg max-w-none [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-semibold [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-white [&_ul]:space-y-1.5">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="mt-4 mb-3 text-4xl font-bold" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="mt-3 mb-2 text-3xl font-bold" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="mt-2 mb-2 text-2xl font-semibold" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-3 text-lg leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="mb-3 list-disc space-y-2 pl-6 text-lg"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="mb-3 list-decimal space-y-2 pl-6 text-lg"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-lg leading-relaxed" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-white" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic" {...props} />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code
                      className="rounded bg-neutral-800 px-2 py-1 text-lg"
                      {...props}
                    />
                  ) : (
                    <code
                      className="block overflow-x-auto rounded bg-neutral-800 p-3 text-lg"
                      {...props}
                    />
                  ),
                a: ({ node, ...props }) => (
                  <a className="text-blue-400 hover:underline" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>

      {message.role === 'user' && (
        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-800">
          <User className="size-6 text-white" />
        </div>
      )}
    </div>
  );
}
