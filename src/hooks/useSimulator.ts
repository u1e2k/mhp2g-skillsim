import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  SimCondition,
  SimSolution,
  WorkerMessageRequest,
  WorkerMessageResponse,
} from '../types';

export function useSimulator(maxResults = 100) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [solutions, setSolutions] = useState<SimSolution[]>([]);
  const [simDuration, setSimDuration] = useState<number | null>(null);
  const [totalChecked, setTotalChecked] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
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

    return () => {
      workerRef.current?.terminate();
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

      const req: WorkerMessageRequest = {
        type: 'SIMULATE',
        condition: cond,
        maxResults,
      };

      workerRef.current?.postMessage(req);
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
