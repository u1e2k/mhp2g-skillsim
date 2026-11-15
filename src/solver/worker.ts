import { solveSim } from './index';
import type { WorkerMessageRequest, WorkerMessageResponse } from '../types';

self.onmessage = (event: MessageEvent<WorkerMessageRequest>) => {
  const { data } = event;
  if (data.type === 'SIMULATE') {
    try {
      const { solutions, totalChecked, durationMs } = solveSim(
        data.condition,
        data.maxResults ?? 100
      );

      const response: WorkerMessageResponse = {
        type: 'DONE',
        solutions,
        totalCombinationsChecked: totalChecked,
        durationMs,
      };

      self.postMessage(response);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const response: WorkerMessageResponse = {
        type: 'ERROR',
        error: errMsg,
      };
      self.postMessage(response);
    }
  }
};
