type ClassValue = string | number | false | null | undefined;

/**
 * Minimal class name joiner. Filters out falsy values and joins with a space.
 * Kept dependency-free — no clsx / tailwind-merge until we actually need them.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
