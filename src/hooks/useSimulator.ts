import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  SimCondition,
  SimSolution,
  WorkerMessageRequest,
  WorkerMessageResponse,
} from '../types';
import { solveSim } from '../solver';

export function useSimulator(maxResults = 100) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [solutions, setSolutions] = useState<SimSolution[]>([]);
  const [simDuration, setSimDuration] = useState<number | null>(null);
  const [totalChecked, setTotalChecked] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // Initialize Worker with fallback support
  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL('../solver/worker.ts', import.meta.url), {
        type: 'module',
      });

      workerRef.current.onmessage = (event: MessageEvent<WorkerMessageResponse>) => {
        const { type, solutions: solList, totalCombinationsChecked, durationMs, error } = event.data;
        setIsSimulating(false);

        if (type === 'DONE') {
          setSolutions(solList ?? []);
          setSimDuration(durationMs ?? 0);
          setTotalChecked(totalCombinationsChecked ?? 0);
          setHasSearched(true);
          setErrorMsg(null);
        } else if (type === 'ERROR') {
          setErrorMsg(error ?? '計算中にエラーが発生しました');
        }
      };

      workerRef.current.onerror = (e) => {
        console.warn('Worker error encountered, falling back to direct solve:', e);
        workerRef.current = null;
      };
    } catch (err) {
      console.warn('Could not initialize Worker, using direct solver fallback:', err);
      workerRef.current = null;
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const executeSimulate = useCallback(
    (cond: SimCondition) => {
      if (Object.keys(cond.targetSkills).length === 0) {
        setSolutions([]);
        setHasSearched(false);
        setIsSimulating(false);
        return;
      }

      setIsSimulating(true);
      setErrorMsg(null);

      // If worker is available, use it
      if (workerRef.current) {
        try {
          const req: WorkerMessageRequest = {
            type: 'SIMULATE',
            condition: cond,
            maxResults,
          };
          workerRef.current.postMessage(req);
          return;
        } catch (err) {
          console.warn('Failed to postMessage to worker, executing directly:', err);
        }
      }

      // Robust fallback: direct synchronous solve (fast, ~10-80ms)
      try {
        const res = solveSim(cond, maxResults);
        setSolutions(res.solutions);
        setSimDuration(res.durationMs);
        setTotalChecked(res.totalChecked);
        setHasSearched(true);
        setErrorMsg(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(msg);
      } finally {
        setIsSimulating(false);
      }
    },
    [maxResults]
  );

  const resetResults = useCallback(() => {
    setSolutions([]);
    setHasSearched(false);
    setErrorMsg(null);
  }, []);

  return {
    isSimulating,
    solutions,
    simDuration,
    totalChecked,
    hasSearched,
    errorMsg,
    executeSimulate,
    resetResults,
  };
}
