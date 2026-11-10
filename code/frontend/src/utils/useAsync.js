import { useCallback, useEffect, useState } from 'react';

/** Run an async loader; exposes { data, loading, error, reload }. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    return fn()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => setState({ data: null, loading: false, error: e.response?.data?.detail || 'Failed to load data.' }));
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}
