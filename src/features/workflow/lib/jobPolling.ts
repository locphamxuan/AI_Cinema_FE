import { workflowService } from '@/services/workflowService';
import type { ApiGenerationJob } from '@/types/workflow';

const WAITING: ApiGenerationJob['status'][] = ['PENDING', 'QUEUED', 'RUNNING'];
const POLL_MS = 3000;
const GIVE_UP_MS = 10 * 60_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Waits until a generation job is COMPLETED, FAILED or CANCELLED. With the backend queue a
 * job comes back from `run` still QUEUED and a worker finishes it later (a video takes up to
 * a minute); without it the job is already done and this returns at once.
 */
export async function waitForJob(job: ApiGenerationJob, pollMs = POLL_MS): Promise<ApiGenerationJob> {
  const deadline = Date.now() + GIVE_UP_MS;
  let current = job;
  while (WAITING.includes(current.status) && Date.now() < deadline) {
    await sleep(pollMs);
    const res = await workflowService.getJob(current.id);
    if (res.success) current = res.data;
  }
  return current;
}
