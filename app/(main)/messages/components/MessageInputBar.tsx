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
    <div className="border-t border-neutral-800 bg-neutral-900/30 p-6">
      {replyingTo && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-neutral-800/50 px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-base text-neutral-400">
              Replying to {replyingTo.sender?.firstName || 'User'}
            </p>
            <p className="truncate text-lg text-neutral-300">
              {replyingTo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-neutral-400 hover:text-white"
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
          className="size-12 text-neutral-400 hover:bg-neutral-800/70 hover:text-white"
          onClick={onOpenUploadDialog}
        >
          <Paperclip className="size-6" />
        </Button>
        <div className="relative flex-1">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyPress}
            className="h-16! border-neutral-700 bg-neutral-800/50 pr-14 text-2xl!"
          />
        </div>
        <Button
          onClick={onSend}
          disabled={disabledSend}
          className="size-14 shrink-0 rounded-full bg-white text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-7" />
        </Button>
      </div>
    </div>
  );
}
