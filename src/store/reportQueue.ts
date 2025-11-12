export interface QueuedReport {
  id: string;
  timestamp: number;
  barangayId?: string;
  customLocation?: string;
  category: string;
  description: string;
  contactName?: string;
  contactNumber?: string;
  lat?: number;
  lng?: number;
  photoFile?: File;
  photoBase64?: string;
  turnstileToken?: string;
}

const STORAGE_KEY = "brgy-report-queue";

export function getQueue(): QueuedReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToQueue(
  report: Omit<QueuedReport, "id" | "timestamp">
): QueuedReport {
  const queued: QueuedReport = {
    ...report,
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
  };
  const queue = getQueue();
  queue.push(queued);
  saveQueue(queue);
  return queued;
}

export function removeFromQueue(id: string): void {
  const queue = getQueue().filter((r) => r.id !== id);
  saveQueue(queue);
}

export function clearQueue(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function saveQueue(queue: QueuedReport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function useReportQueue() {
  return {
    getQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };
}
