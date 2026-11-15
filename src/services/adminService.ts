/**
 * Accounts and permissions (Admin), and the read-only member list (Staff).
 */
import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { UserRole } from '@/types/production';

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
  /** Catalog group, e.g. 'movie-project' or 'administration'. */
  area: string;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
  /** Permissions this role can never lose (ADMIN keeps account and permission management). */
  lockedPermissions: string[];
}

export interface AccountUpdate {
  fullName?: string;
  email?: string;
  /** Sets a new password and signs the account out everywhere. */
  password?: string;
  role?: UserRole;
  isActive?: boolean;
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

  /** A staff account (Creator, Reviewer, Staff, Admin); members sign up themselves. */
  createAccount(dto: { email: string; fullName: string; role: UserRole; password: string }): Promise<ApiResponse<AccountRow>> {
    return apiClient.post<AccountRow>(ROUTES.USERS, dto);
  },

  updateAccount(userId: string, dto: AccountUpdate): Promise<ApiResponse<AccountRow>> {
    return apiClient.patch<AccountRow>(ROUTES.USER_DETAIL(userId), dto);
  },

  /** Only an account with no activity; the backend answers 409 for one to lock instead. */
  deleteAccount(userId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(ROUTES.USER_DETAIL(userId));
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
