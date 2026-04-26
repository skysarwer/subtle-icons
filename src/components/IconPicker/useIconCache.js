/**
 * Simple in-memory cache for icon collections.
 * 
 * This prevents re-fetching the same collection when closing/opening the modal
 * or switching between categories.
 */

const cache = new Map();

// Tracks keys that have an in-flight prefetch, preventing duplicate requests.
const inflight = new Set();

export const getCachedIcons = (key) => {
    return cache.get(key);
};

export const isInflight = (key) => inflight.has(key);
export const markInflight = (key) => inflight.add(key);
export const unmarkInflight = (key) => inflight.delete(key);

export const setCachedIcons = (key, icons) => {
    cache.set(key, icons);
};

export const clearIconCache = () => {
    cache.clear();
};
