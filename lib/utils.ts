import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
          acc[key as keyof T] = trimmed as T[keyof T];
        }
      } else {
        acc[key as keyof T] = value;
      }
    }
    return acc;
  }, {} as Partial<T>);
}