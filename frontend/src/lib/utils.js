import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for combining tailwind classes with proper merging.
 * This is the standard Shadcn/UI cn() utility for merging CSS classes
 * while avoiding conflicts between tailwind utilities.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
