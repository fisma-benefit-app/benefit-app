import { useCallback, useEffect, useRef } from "react";

// Debounce hook for auto-saving projects
export default function useDebounce<
  T extends (...args: unknown[]) => void | Promise<void>,
>(func: T, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCallRef = useRef<(() => void | Promise<void>) | null>(null);
  const runningCallRef = useRef<Promise<void> | null>(null);

  // Runs the waiting call now and resolves when it (or a call already
  // running) has finished.
  const flush = useCallback((): Promise<void> => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;

    const call = pendingCallRef.current;
    pendingCallRef.current = null;
    if (call) {
      // Wait for a save already running: two overlapping saves would carry the same
      // lockVersion and the second would be rejected as a conflict with the first.
      const running = (runningCallRef.current ?? Promise.resolve())
        .catch(() => undefined)
        .then(call)
        .finally(() => {
          if (runningCallRef.current === running) runningCallRef.current = null;
        });
      runningCallRef.current = running;
    }
    return runningCallRef.current ?? Promise.resolve();
  }, []);

  const isPending = useCallback(
    () => pendingCallRef.current !== null || runningCallRef.current !== null,
    [],
  );

  function debounced(...args: Parameters<T>) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pendingCallRef.current = () => func(...args);
    timeoutRef.current = setTimeout(flush, delay);
  }

  // Leaving the page (e.g. to the project list) saves instead of dropping
  // the waiting call.
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  return { debounced, flush, isPending };
}
