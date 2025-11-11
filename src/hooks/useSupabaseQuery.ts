import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface UseSupabaseQueryOptions {
  enabled?: boolean;
}

export function useSupabaseQuery<T>(
  table: string,
  options: UseSupabaseQueryOptions = {}
): {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    async function fetch() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from(table).select("*");
        if (error) throw error;
        setData(data as T[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [table, enabled]);

  return { data, loading, error };
}
