/**
 * MF-1 B2B Contract Negotiation Service (Admin & Studio Partner)
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Contract, ContractCostInput, CreateContractInput } from '@/types/contract';

const R = API_ROUTES.PRODUCTION;

const localContracts: Record<string, Contract[]> = {};

function getLocalContracts(projectId: string): Contract[] {
  if (!localContracts[projectId]) {
    localContracts[projectId] = [
      {
        id: `contract-${projectId}-r1`,
        projectId,
        studioId: 'studio-sgvfx-01',
        round: 1,
        costVnd: 150_000_000,
        proposedBy: 'STUDIO',
        status: 'STUDIO_SIGNED',
        terms: 'Bàn giao trọn bộ bản dựng 4K UHD Master kèm toàn bộ prompt, khai báo Điều 44 Luật AI.',
        studioSignedAt: new Date().toISOString(),
        adminSignedAt: null,
        createdById: 'admin-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studio: {
          id: 'studio-sgvfx-01',
          name: 'Saigon VFX Studio Lab',
          email: 'contact@saigonvfx.example',
          phone: '0909123456',
          contactName: 'Lê Tuấn Anh',
          note: null,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      },
    ];
  }
  return localContracts[projectId];
}

export const contractService = {
  // Admin endpoints
  listContracts: (projectId: string): Promise<ApiResponse<Contract[]>> =>
    apiClient.get<Contract[]>(R.CONTRACTS(projectId), {}, () => getLocalContracts(projectId)),

  resendContract: (projectId: string, input: CreateContractInput): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.CONTRACTS(projectId), input, {}, () => {
      const list = getLocalContracts(projectId);
      const newRound: Contract = {
        ...list[0],
        id: `contract-${projectId}-r${list.length + 1}`,
        round: list.length + 1,
        status: 'SENT',
        costVnd: null,
        terms: input.terms || list[0].terms,
        adminSignedAt: null,
        studioSignedAt: null,
      };
      list.unshift(newRound);
      return newRound;
    }),

  signContract: (contractId: string): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.CONTRACT_SIGN(contractId), {}, {}, () => {
      for (const pId of Object.keys(localContracts)) {
        const found = localContracts[pId].find((c) => c.id === contractId);
        if (found) {
          found.status = 'SIGNED';
          found.adminSignedAt = new Date().toISOString();
          return found;
        }
      }
      return {
        id: contractId,
        projectId: 'project-default',
        studioId: 'studio-01',
        round: 1,
        costVnd: 150_000_000,
        status: 'SIGNED',
        terms: 'Hợp đồng hoàn tất 2 chữ ký số.',
        adminSignedAt: new Date().toISOString(),
        studioSignedAt: new Date().toISOString(),
        createdById: 'admin-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),

  counterContract: (contractId: string, input: ContractCostInput): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.CONTRACT_COUNTER(contractId), input, {}, () => {
      for (const pId of Object.keys(localContracts)) {
        const list = localContracts[pId];
        const found = list.find((c) => c.id === contractId);
        if (found) {
          found.status = 'SUPERSEDED';
          const nextRound: Contract = {
            ...found,
            id: `contract-${pId}-r${list.length + 1}`,
            round: list.length + 1,
            costVnd: input.costVnd,
            proposedBy: 'ADMIN',
            status: 'ADMIN_COUNTERED',
            adminSignedAt: new Date().toISOString(),
            studioSignedAt: null,
          };
          list.unshift(nextRound);
          return nextRound;
        }
      }
      return {
        id: `contract-counter-${Date.now()}`,
        projectId: 'project-default',
        studioId: 'studio-01',
        round: 2,
        costVnd: input.costVnd,
        proposedBy: 'ADMIN',
        status: 'ADMIN_COUNTERED',
        terms: 'Báo giá Admin đề xuất lại.',
        adminSignedAt: new Date().toISOString(),
        createdById: 'admin-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),

  // Studio Portal endpoints
  listStudioContracts: (): Promise<ApiResponse<Contract[]>> =>
    apiClient.get<Contract[]>(R.STUDIO_PORTAL_CONTRACTS, {}, () => getLocalContracts('demo')),

  proposeStudioCost: (contractId: string, input: ContractCostInput): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.STUDIO_PORTAL_PROPOSE(contractId), input),

  signStudioContract: (contractId: string): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.STUDIO_PORTAL_SIGN(contractId), {}),

  counterStudioContract: (contractId: string, input: ContractCostInput): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.STUDIO_PORTAL_COUNTER(contractId), input),
};
