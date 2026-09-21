"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(query, cb),
    () => window.matchMedia(query).matches,
    () => false
  );
}