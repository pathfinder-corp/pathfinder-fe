import type { KeyboardEvent } from 'react';
import { X, Paperclip, Send } from 'lucide-react';

import type { IChatMessage } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type MessageInputBarProps = {
  messageInput: string;
  onChange: (value: string) => void;
  onKeyPress: (event: KeyboardEvent) => void;
  onSend: () => void;
  disabledSend: boolean;
  onOpenUploadDialog: () => void;
  replyingTo: IChatMessage | null;
  onCancelReply: () => void;
};

export function MessageInputBar({
  messageInput,
  onChange,
  onKeyPress,
  onSend,
  disabledSend,
  onOpenUploadDialog,
  replyingTo,
  onCancelReply,
}: MessageInputBarProps) {
  return (
    <div className="p-6 border-t border-neutral-800 bg-neutral-900/30">
      {replyingTo && (
        <div className="flex items-center justify-between mb-4 px-5 py-3 bg-neutral-800/50 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-base text-neutral-400 mb-1">
              Replying to {replyingTo.sender?.firstName || 'User'}
            </p>
            <p className="text-lg text-neutral-300 truncate">
              {replyingTo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-neutral-400 hover:text-white shrink-0"
            onClick={onCancelReply}
          >
            <X className="size-5" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-12 text-neutral-400 hover:text-white hover:bg-neutral-800/70"
          onClick={onOpenUploadDialog}
        >
          <Paperclip className="size-6" />
        </Button>
        <div className="flex-1 relative">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyPress}
            className="h-16! pr-14 bg-neutral-800/50 border-neutral-700 text-2xl!"
          />
        </div>
        <Button
          onClick={onSend}
          disabled={disabledSend}
          className="size-14 rounded-full bg-white text-black hover:bg-neutral-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="size-7" />
        </Button>
      </div>
    </div>
  );
}