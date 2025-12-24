'use client';

import { useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot } from 'lucide-react';
import type { IChatMessage } from '../types';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { TextShimmer } from '@/components/motion-primitives/text-shimmer';
import { ChatMessage } from './ChatMessage';

interface IAIChatInterfaceProps {
  chatMessages: IChatMessage[];
  chatInput: string;
  isLoading: boolean;
  suggestedQuestions: string[];
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onSuggestedQuestionClick: (question: string) => void;
}

export function AIChatInterface({
  chatMessages,
  chatInput,
  isLoading,
  suggestedQuestions,
  onInputChange,
  onSendMessage,
  onSuggestedQuestionClick,
}: IAIChatInterfaceProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessages.length > 0 || isLoading) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-81.5px)] flex-col">
      {chatMessages.length === 0 && (
        <div className="border-b border-neutral-800 bg-neutral-900/30 p-6">
          <p className="-mt-4 mb-4 text-xl text-neutral-400">
            Suggested questions:
          </p>
          <div className="space-y-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestedQuestionClick(question)}
                className="w-full cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-left text-lg transition-all hover:border-neutral-700 hover:bg-neutral-900"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-165px)] p-6">
        <div className="space-y-4">
          {chatMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start gap-3">
              <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
                <Bot className="size-6 text-black" />
              </div>
              <div className="max-w-[75%] rounded-lg border border-neutral-800 bg-neutral-900 p-5">
                <TextShimmer
                  as="span"
                  className="text-lg"
                  duration={1}
                  spread={4}
                >
                  AI is thinking...
                </TextShimmer>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-neutral-800 bg-neutral-900/30 p-6">
        <div className="mb-3 flex items-start gap-3">
          <Textarea
            value={chatInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this step..."
            rows={2}
            className="custom-scrollbar max-h-[3.5rem] min-h-[7rem] flex-1 resize-none border-neutral-800 bg-neutral-900 text-xl!"
            disabled={isLoading}
          />
          <Button
            onClick={onSendMessage}
            disabled={!chatInput.trim() || isLoading}
            size="icon"
            className="size-14 bg-white text-neutral-950 hover:bg-neutral-200"
          >
            <Send className="size-6" />
          </Button>
        </div>
        <p className="flex items-center gap-1.5 text-lg text-neutral-500">
          Press <Kbd>Enter</Kbd> to send,{' '}
          <KbdGroup>
            <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd>
          </KbdGroup>{' '}
          for new line
        </p>
      </div>
    </div>
  );
}
