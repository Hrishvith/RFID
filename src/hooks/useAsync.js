import { useEffect, useState, useCallback } from "react";

/**
 * Runs an async service call and exposes:
 * { data, loading, error, refetch }
 *
 * @template T
 * @param {() => Promise<T>} asyncFn
 * @param {Array} deps
 * @param {number|null} refreshInterval Refresh interval in milliseconds
 */
export function useAsync(asyncFn, deps = [], refreshInterval = null) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const run = useCallback(async () => {
    try {
      setState((prev) => ({
  ...prev,
  loading: prev.data === null,
  error: null,
}));

      const data = await asyncFn();

      setState({
        data,
        loading: false,
        error: null,
      });

    } catch (error) {

      setState({
        data: null,
        loading: false,
        error,
      });

    }
  }, deps);

  useEffect(() => {

    run();

    if (!refreshInterval) return;

    const interval = setInterval(() => {
      run();
    }, refreshInterval);

    return () => clearInterval(interval);

  }, [run, refreshInterval]);

  return {
    ...state,
    refetch: run,
  };
}