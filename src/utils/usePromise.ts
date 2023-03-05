import CancelablePromise, { isCancelablePromise } from 'cancelable-promise';
import { useEffect, useMemo, useRef, useState } from 'react';
import { wait } from './timer';

export function usePromise<T, A extends unknown[] = unknown[]>(
  loader: (...args: A) => CancelablePromise<T> | Promise<T>,
  options: {
    respectLoading: boolean
    debounceTimer: number,
  } = {
    respectLoading: false,
    debounceTimer: 0
  },
) {
  const [state, setState] = useState<'none' | 'loading' | 'resolved' | 'rejected'>('none');
  const response = useRef<T>();
  const error = useRef<unknown>();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const promise = useRef<ReturnType<typeof loader>>();

  const cancel = () => {
    clearTimeout(timer.current);
    if (promise.current && isCancelablePromise(promise.current)) {
      (promise.current as CancelablePromise).cancel();
    }
    promise.current = undefined;
    setState('none');
  };

  const refresh = (...args: A) => {
    if (options.respectLoading && state === 'loading') {
      return promise.current as ReturnType<typeof loader>;
    }
    cancel();
    setState('loading');
    promise.current = wait(options.debounceTimer)
    .then(() => loader(...args))
    .then((resp) => {
      error.current = undefined;
      response.current = resp;
      setState('resolved');
      return resp;
    })
    .catch((e) => {
      error.current = e;
      response.current = undefined;
      setState('rejected');
      throw e;
    });
    return promise.current;

  }

  useEffect(() => () => {
    cancel();
    setState('none');
  }, []);

  return useMemo(() => ({
    state,
    response: response.current,
    error: error.current,
    refresh,
  }), [state]);
}