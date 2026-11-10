/**
 * MF-1 B2B Contract Negotiation Service (Admin & Studio Partner)
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Contract, ContractCostInput, CreateContractInput } from '@/types/contract';

const R = API_ROUTES.PRODUCTION;

export const contractService = {
  // Admin endpoints
  listContracts: (projectId: string): Promise<ApiResponse<Contract[]>> =>
    apiClient.get<Contract[]>(R.CONTRACTS(projectId)),

  resendContract: (projectId: string, input: CreateContractInput): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.CONTRACTS(projectId), input),

  signContract: (contractId: string): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.CONTRACT_SIGN(contractId), {}),

  counterContract: (contractId: string, input: ContractCostInput): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.CONTRACT_COUNTER(contractId), input),

  // Studio Portal endpoints
  listStudioContracts: (): Promise<ApiResponse<Contract[]>> =>
    apiClient.get<Contract[]>(R.STUDIO_PORTAL_CONTRACTS),

  proposeStudioCost: (contractId: string, input: ContractCostInput): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.STUDIO_PORTAL_PROPOSE(contractId), input),

  signStudioContract: (contractId: string): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.STUDIO_PORTAL_SIGN(contractId), {}),

  counterStudioContract: (contractId: string, input: ContractCostInput): Promise<ApiResponse<Contract>> =>
    apiClient.post<Contract>(R.STUDIO_PORTAL_COUNTER(contractId), input),
};
