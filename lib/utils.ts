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

export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function searchVietnamese(text: string, query: string): boolean {
  const normalizedText = removeVietnameseTones(text);
  const normalizedQuery = removeVietnameseTones(query);
  return normalizedText.includes(normalizedQuery);
}

export function extractTitle(title: string): string {
  if (!title || typeof title !== 'string') return '';
  
  const trimmed = title.trim();
  const parts = trimmed.split(':');
  
  if (parts.length > 1) {
    const extracted = parts.slice(1).join(':').trim();
    return extracted || trimmed;
  }
  
  return trimmed;
}

export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}