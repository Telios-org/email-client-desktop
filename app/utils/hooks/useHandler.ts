// This code came from the https://github.com/WebClients/packages/components/hooks/useHandler.ts
// Which is under an open source license
import { useRef, useEffect, useMemo } from 'react';
import { debounce, throttle } from '../helpers/function';

export type Handler = (...args: any[]) => void;

export interface Abortable {
  abort?: () => void;
}

/**
 * Create a stable reference of handler
 * But will always run the updated version of the handler in argument
 */
export const useHandler = <T extends Handler>(
  handler: T,
  options: { debounce?: number; throttle?: number } = {}
): T & Abortable => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const actualHandler = useMemo(() => {
    const handler = (...args: any[]) => handlerRef.current(...args);

    if (options.debounce && options.debounce > 0) {
      return debounce(handler, options.debounce);
    }

    if (options.throttle && options.throttle > 0) {
      return throttle(handler, options.throttle);
    }

    return handler;
  }, [options.debounce, options.throttle]) as T & Abortable;

  return actualHandler;
};
