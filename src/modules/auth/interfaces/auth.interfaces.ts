export interface IAuthUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];  // Made required instead of optional
    tenantId?: string;
    permissions: string[];  // Made required instead of optional
  }
  
  export interface IRole {
    name: string;
    permissions: string[];
    description?: string;
  }
  
  export interface IPermission {
    name: string;
    description?: string;
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  }
  
  export interface IAuditLog {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    success: boolean;
    reason?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
    ip?: string;
    userAgent?: string;
  }