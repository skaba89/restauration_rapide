'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { debounce, throttle } from 'lodash';

/**
 * Hook for debouncing a value
 * Useful for search inputs, etc.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling a value
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timeoutId = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timeoutId);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Hook for debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(
    () =>
      debounce((...args: Parameters<T>) => callbackRef.current(...args), delay) as T,
    [delay]
  );
}

/**
 * Hook for throttled callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 300
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(
    () =>
      throttle((...args: Parameters<T>) => callbackRef.current(...args), interval) as T,
    [interval]
  );
}

/**
 * Hook for intersection observer (lazy loading)
 */
interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const frozen = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || (frozen.current && freezeOnceVisible)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible && freezeOnceVisible) {
          frozen.current = true;
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [ref, isVisible];
}

/**
 * Hook for lazy loading images
 */
export function useLazyLoad(src: string | null): {
  imageRef: React.RefObject<HTMLImageElement>;
  isLoaded: boolean;
  isIntersecting: boolean;
} {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(image);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(image);

    return () => {
      observer.unobserve(image);
    };
  }, [src]);

  useEffect(() => {
    if (!isIntersecting || !src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isIntersecting, src]);

  return { imageRef, isLoaded, isIntersecting };
}

/**
 * Hook for window resize with debounce
 */
export function useWindowSize(delay: number = 100): { width: number; height: number } {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, delay);

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, [delay]);

  return size;
}

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook for online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for local storage with SSR support
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Hook for copy to clipboard
 */
export function useCopyToClipboard(): [(text: string) => Promise<boolean>, boolean] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopied(false);
      return false;
    }
  }, []);

  return [copy, copied];
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook for click outside detection
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}

/**
 * Hook for keyboard shortcuts
 */
type KeyHandler = (event: KeyboardEvent) => void;

export function useKeyboardShortcut(
  keys: string[],
  callback: KeyHandler,
  options: { ctrl?: boolean; alt?: boolean; shift?: boolean } = {}
): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const { ctrl = false, alt = false, shift = false } = options;

      const matchesModifiers =
        event.ctrlKey === ctrl &&
        event.altKey === alt &&
        event.shiftKey === shift;

      const matchesKey = keys.some(
        (key) => event.key.toLowerCase() === key.toLowerCase()
      );

      if (matchesModifiers && matchesKey) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [keys, callback, options]);
}

/**
 * Hook for infinite scroll
 */
interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  threshold?: number;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  threshold = 200,
}: UseInfiniteScrollOptions): React.RefObject<HTMLDivElement> {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, threshold]);

  return loadMoreRef;
}

export default {
  useDebounce,
  useThrottle,
  useDebouncedCallback,
  useThrottledCallback,
  useIntersectionObserver,
  useLazyLoad,
  useWindowSize,
  useMediaQuery,
  useOnlineStatus,
  useLocalStorage,
  useCopyToClipboard,
  usePrevious,
  useClickOutside,
  useKeyboardShortcut,
  useInfiniteScroll,
};
