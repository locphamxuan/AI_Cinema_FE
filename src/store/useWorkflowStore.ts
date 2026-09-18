/**
 * Re-export shim: the MF1 (Maker-Checker) workflow store now lives under
 * features/workflow/store, split into slices. Keep importing from
 * '@/store/useWorkflowStore' — it still resolves here.
 */
export * from '@/features/workflow/store/useWorkflowStore';
