'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors',
      'focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-700',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-6 w-6 rounded-full shadow-lg ring-0',
        'transition-all duration-200 ease-in-out',
        'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        'data-[state=checked]:bg-neutral-950 data-[state=unchecked]:bg-neutral-300'
      )}
    />
  </SwitchPrimitive.Root>
));

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
