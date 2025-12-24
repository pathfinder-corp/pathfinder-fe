import { ReactNode } from 'react';

import LightRays from '@/components/LightRays';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="absolute inset-0 size-full">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      <div className="z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}
