/**
 * Accounts and permissions (Admin), and the read-only member list (Staff).
 */
import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { UserRole } from '@/types/workflow-api-enums';

const ROUTES = API_ROUTES.ADMIN;

export interface AccountRow {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AccountPage {
  data: AccountRow[];
  meta: { totalItems: number; currentPage: number; totalPages: number; itemsPerPage: number };
}

export interface PermissionRow {
  key: string;
  area: 'production' | 'operations' | 'admin';
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
  /** Permissions this role can never lose (ADMIN keeps account and permission management). */
  lockedPermissions: string[];
}

export interface AccountQuery {
  page?: number;
  search?: string;
  role?: UserRole;
  limit?: number;
}

function accountsUrl({ page = 1, search, role, limit = 20 }: AccountQuery): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: 'createdAt:DESC' });
  if (search?.trim()) params.set('search', search.trim());
  if (role) params.set('filter.role', `$eq:${role}`);
  return `${ROUTES.USERS}?${params.toString()}`;
}

export const adminService = {
  listAccounts(query: AccountQuery = {}): Promise<ApiResponse<AccountPage>> {
    return apiClient.get<AccountPage>(accountsUrl(query));
  },

  updateAccount(userId: string, dto: { role?: UserRole; isActive?: boolean }): Promise<ApiResponse<AccountRow>> {
    return apiClient.patch<AccountRow>(ROUTES.USER_DETAIL(userId), dto);
  },

  listPermissions(): Promise<ApiResponse<PermissionRow[]>> {
    return apiClient.get<PermissionRow[]>(ROUTES.PERMISSIONS);
  },

  listRoles(): Promise<ApiResponse<RolePermissions[]>> {
    return apiClient.get<RolePermissions[]>(ROUTES.ROLES);
  },

  setRolePermissions(role: UserRole, permissions: string[]): Promise<ApiResponse<RolePermissions>> {
    return apiClient.put<RolePermissions>(ROUTES.ROLE_PERMISSIONS(role), { permissions });
  },
};
