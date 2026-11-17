import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { Student } from "../types";

export function useStudents(q: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listStudents(q);
      if (id === requestId.current) setStudents(data);
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : "Failed to load students");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { students, loading, error, refetch };
}
