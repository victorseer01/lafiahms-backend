export interface IAuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  tenantId?: string;
  permissions?: string[];
}