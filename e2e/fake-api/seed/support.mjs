// A support case the AI assistant handed to Staff (MF-5), with the member's wallet and plan the desk reads.
import { U } from './people.mjs';

const AT = '2026-11-20T03:00:00.000Z';

export function support() {
  return {
    supportCases: [
      {
        id: 'case-0001', status: 'WAITING_FOR_STAFF', priority: 'HIGH', escalationReason: 'MEMBER_REQUEST', escalationNote: null,
        aiSummary: 'Member nạp Coin nhưng chưa thấy cộng vào ví.', memberId: U.member.id, memberFullName: U.member.fullName,
        assignedAgentId: null, assignedAgentName: null, lastMessageAt: AT, escalatedAt: AT, claimedAt: null, resolvedAt: null,
        closedAt: null, resolutionNote: null, satisfactionRating: null, satisfactionComment: null, aiTurns: 2, createdAt: AT, updatedAt: AT,
      },
    ],
    supportMessages: [
      { id: 'msg-1', caseId: 'case-0001', senderType: 'MEMBER', content: 'Tôi nạp 50.000 đ mà ví chưa có Coin.', isInternal: false, aiMetadata: null, createdAt: AT },
      { id: 'msg-2', caseId: 'case-0001', senderType: 'AI_CHATBOT', content: 'Mình chuyển yêu cầu cho nhân viên hỗ trợ nhé.', isInternal: false, aiMetadata: null, createdAt: AT },
    ],
    memberContext: {
      Account: { email: U.member.email, fullName: U.member.fullName, phoneNumber: null, isActive: true, emailVerifiedAt: AT, createdAt: AT },
      Subscription: { status: 'ACTIVE', autoRenew: true, currentPeriodEnd: '2026-12-20T03:00:00.000Z', cancelWindowEndsAt: null, priceCoins: 99, plan: { name: 'Gói Tháng' } },
      Wallet: { mainBalance: 120, bonusBalance: 30 },
      Transactions: [{ entryType: 'TOP_UP', mainAmount: 50, bonusAmount: 0, createdAt: AT, description: null }],
    },
  };
}
