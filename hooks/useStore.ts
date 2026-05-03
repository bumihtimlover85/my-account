'use client';

import { useSyncExternalStore } from 'react';
import { getStore } from '@/lib/store';
import type { AppData } from '@/types';

function subscribe(callback: () => void) {
  return getStore().subscribe(callback);
}

function getSnapshot(): AppData {
  return getStore().getData();
}

function getServerSnapshot(): AppData {
  return { user: null, transactions: [], categories: [] };
}

/**
 * React-idiomatic hook that subscribes to the global store
 * using useSyncExternalStore for Concurrent Mode safety.
 */
export function useStore(): AppData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
