/**
 * @fileoverview Concurrency-limited texture creation queue. Smooths the boot
 * memory spike on iOS Safari by ensuring at most MAX_CONCURRENT label
 * canvases are being rasterized + uploaded to the GPU at once.
 */

// src/utils/texture-queue.ts

const MAX_CONCURRENT = 4;

let inFlight = 0;

interface Waiter {
  resolve: () => void;
  reject: (error: Error) => void;
  settled: boolean;
}

const waiters: Waiter[] = [];

function drainNext(): void {
  while (waiters.length > 0) {
    const next = waiters.shift();
    if (!next || next.settled) continue;
    next.resolve();
    return;
  }
}

/**
 * Run `fn` once a slot is available, never exceeding MAX_CONCURRENT in-flight
 * calls. Honors `signal`: aborting before the slot is acquired rejects with
 * AbortError and removes the waiter from the queue. The factory `fn` itself
 * is responsible for re-checking the signal once it runs.
 *
 * IMPORTANT: callers must pass `() => createX(...)`, not a pre-built promise —
 * factories like createCanvasTexture allocate canvases synchronously, so they
 * must not run until a slot is held.
 */
export async function withTextureSlot<T>(
  fn: () => Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  if (signal?.aborted) {
    const error = new Error('Aborted before slot acquired');
    error.name = 'AbortError';
    throw error;
  }

  if (inFlight >= MAX_CONCURRENT) {
    await new Promise<void>((resolveOuter, rejectOuter) => {
      const waiter: Waiter = {
        resolve: () => undefined,
        reject: () => undefined,
        settled: false,
      };

      const onAbort = (): void => {
        if (waiter.settled) return;
        waiter.settled = true;
        const idx = waiters.indexOf(waiter);
        if (idx >= 0) waiters.splice(idx, 1);
        const error = new Error('Aborted while waiting for slot');
        error.name = 'AbortError';
        rejectOuter(error);
      };

      // Wrap resolve/reject so they only fire once and always remove the
      // abort listener — prevents a late-firing abort from rejecting an
      // already-resolved waiter.
      waiter.resolve = (): void => {
        if (waiter.settled) return;
        waiter.settled = true;
        signal?.removeEventListener('abort', onAbort);
        resolveOuter();
      };
      waiter.reject = (error: Error): void => {
        if (waiter.settled) return;
        waiter.settled = true;
        signal?.removeEventListener('abort', onAbort);
        rejectOuter(error);
      };

      waiters.push(waiter);
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  inFlight++;
  try {
    return await fn();
  } finally {
    inFlight--;
    drainNext();
  }
}
