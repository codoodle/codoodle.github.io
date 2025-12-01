"use client";

import { useEffect, useMemo, useRef } from "react";

export default function DoodleListInfiniteTrigger({
  isPrevious,
  onStartReached,
  onEndReached,
}:
  | {
      isPrevious: true;
      isNext?: never;
      onStartReached: () => void;
      onEndReached?: never;
    }
  | {
      isPrevious?: never;
      isNext: true;
      onStartReached?: never;
      onEndReached: () => void;
    }) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const onTrigger = useMemo(
    () => (isPrevious ? onStartReached : onEndReached),
    [isPrevious, onEndReached, onStartReached],
  );

  useEffect(() => {
    const elLoader = loaderRef.current;
    if (!elLoader || !onTrigger) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onTrigger();
        }
      },
      { rootMargin: "100px", threshold: 0.1 },
    );
    observer.observe(elLoader);
    return () => observer.disconnect();
  }, [onTrigger]);

  return <div ref={loaderRef} style={{ height: 1 }} aria-hidden="true" />;
}
