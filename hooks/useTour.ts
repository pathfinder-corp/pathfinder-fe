'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type TourStep = {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
  };
};

export const useTour = (storageKey: string) => {
  const driverObj = useRef<any>(null);
  const cssLoadedRef = useRef<boolean>(false);
  
  const [isTourCompleted, setIsTourCompleted] = useState<boolean>(false);

  const initializeDriver = useCallback(async () => {
    if (typeof window === 'undefined' || driverObj.current) return driverObj.current;

    try {
      if (!cssLoadedRef.current && typeof document !== 'undefined') {
        const existingLink = document.querySelector('link[href*="driver.css"]');
        if (!existingLink) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.4.0/dist/driver.min.css';
          document.head.appendChild(link);
        }
        cssLoadedRef.current = true;
      }

      const { driver } = await import('driver.js');

      driverObj.current = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps: [],
        onDestroyStarted: () => {
        },
        onDestroyed: () => {
        },
      });

      return driverObj.current;
    } catch (error) {
      console.error('Failed to load driver.js:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const completed = localStorage.getItem(storageKey) === 'true';
    setIsTourCompleted(completed);

    return () => {
      if (driverObj.current) {
        try {
          driverObj.current.destroy();
        } catch (error) {}
        driverObj.current = null;
      }
    };
  }, [storageKey]);

  const startTour = useCallback(async (steps: TourStep[]) => {
    if (isTourCompleted) return;

    const driver = await initializeDriver();
    if (!driver) {
      console.warn('Driver.js not initialized, skipping tour');
      return;
    }

    try {
      const { driver: DriverClass } = await import('driver.js');
      
      if (driverObj.current) {
        try {
          driverObj.current.destroy();
        } catch (error) {}
      }

      let wasCompleted = false;

      driverObj.current = DriverClass({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps: steps,
        onNextClick: (element, step, options) => {
          const { driver } = options;
          
          if (driver.isLastStep()) {
            wasCompleted = true;
            localStorage.setItem(storageKey, 'true');
            setIsTourCompleted(true);
            driver.destroy();
          } else {
            driver.moveNext();
          }
        },
        onPrevClick: (element, step, options) => {
          const { driver } = options;
          driver.movePrevious();
        },
        onDestroyStarted: (element, step, options) => {
          const { driver } = options;
          if (!wasCompleted) {
            if (driver && driver.destroy) {
              driver.destroy();
            }
          }
        },
        onDestroyed: (element, step, options) => {
        },
      });

      driverObj.current.drive();
    } catch (error) {
      console.error('Error starting tour:', error);
    }
  }, [isTourCompleted, initializeDriver, storageKey]);

  const resetTour = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(storageKey);
    setIsTourCompleted(false);
  }, [storageKey]);

  return {
    startTour,
    resetTour,
    isTourCompleted,
  };
};