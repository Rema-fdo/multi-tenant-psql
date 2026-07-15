import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
  sub: string;
  role: Role;
  // Present for org_admin and end_user, absent for the super admin.
  organizationId?: string;
  email?: string;
}

// Shape attached to the request once a token is verified.
export interface AuthUser {
  id: string;
  role: Role;
  organizationId?: string;
  email?: string;
}
