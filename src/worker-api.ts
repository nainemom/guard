import type { METHODS } from '@/codec';

export type CodecMethod = keyof typeof METHODS;

type Pending = {
  resolve: (value: never) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, Pending>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (
      e: MessageEvent<{ id: number; result?: unknown; error?: string }>,
    ) => {
      const { id, result, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (error !== undefined) {
        p.reject(new Error(error));
      } else {
        p.resolve(result as never);
      }
    };
    worker.onerror = () => {
      for (const [, p] of pending) {
        p.reject(new Error('Worker error'));
      }
      pending.clear();
    };
  }
  return worker;
}

function post<T>(msg: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, {
      resolve: resolve as (value: never) => void,
      reject,
    });
    getWorker().postMessage({ ...msg, id });
  });
}

export function workerEncrypt(
  content: Uint8Array,
  keyValue: string,
  codec: CodecMethod,
): Promise<string | File> {
  return post({ type: 'encrypt', content, keyValue, codec });
}

export function workerDecrypt(
  input: string | File,
  keyValue: string,
  codec: CodecMethod,
): Promise<Uint8Array> {
  return post({ type: 'decrypt', input, keyValue, codec });
}
