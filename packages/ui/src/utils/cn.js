import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes cleanly with conflict resolution.
 * Example: cn('px-2 py-1', isPrimary && 'bg-brand-600', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
