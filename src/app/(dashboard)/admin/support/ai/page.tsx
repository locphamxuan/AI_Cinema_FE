import { Suspense } from 'react';
import { AiConsolePage } from '@/features/ai-console/AiConsolePage';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSION } from '@/lib/permissions';

/** MF-5 AI Chatbox console: Admin only (`support:knowledge.manage`). */
export default function Page() {
  return (
    <PermissionGate permission={PERMISSION.SUPPORT_KNOWLEDGE_MANAGE}>
      <Suspense>
        <AiConsolePage />
      </Suspense>
    </PermissionGate>
  );
}
