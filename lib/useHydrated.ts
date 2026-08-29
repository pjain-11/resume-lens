import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `false` during server render and the first client render (hydration),
 * then `true`. Use it to gate browser-only UI (e.g. reading `localStorage`)
 * without causing a hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
