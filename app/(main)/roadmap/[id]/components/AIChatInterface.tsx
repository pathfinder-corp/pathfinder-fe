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
    <div 
      className="flex flex-col h-[calc(100vh-81.5px)]"
    >
      {chatMessages.length === 0 && (
        <div className="p-6 border-b border-neutral-800 bg-neutral-900/30">
          <p className="-mt-4 text-xl text-neutral-400 mb-4">Suggested questions:</p>
          <div className="space-y-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestedQuestionClick(question)}
                className="cursor-pointer w-full text-left p-4 text-lg bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all"
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
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 size-10 rounded-full bg-white flex items-center justify-center mt-1">
                <Bot className="size-6 text-black" />
              </div>
              <div className="max-w-[75%] rounded-lg p-5 bg-neutral-900 border border-neutral-800">
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

      <div className="p-6 border-t border-neutral-800 bg-neutral-900/30">
        <div className="flex items-start gap-3 mb-3">
          <Textarea
            value={chatInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this step..."
            rows={2}
            className="custom-scrollbar flex-1 min-h-14 max-h-14 resize-none bg-neutral-900 border-neutral-800 text-xl!"
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
        <p className="text-lg text-neutral-500 flex items-center gap-1.5">
          Press <Kbd>Enter</Kbd> to send, <KbdGroup><Kbd>Shift</Kbd> + <Kbd>Enter</Kbd></KbdGroup> for new line
        </p>
      </div>
    </div>
  );
}