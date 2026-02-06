// utils/loading.ts
export let loading = false;
let listeners: (() => void)[] = [];

// Sets the loading value and notifies listeners
export const setLoading = (value: boolean) => {
  loading = value;
  listeners.forEach((listener) => listener());
};

// Subscribe to changes in loading state
export const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

