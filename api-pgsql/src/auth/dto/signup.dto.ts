import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

// Super admin cannot be created through signup, so it is excluded here.
const SIGNUP_ROLES = [Role.OrgAdmin, Role.EndUser] as const;

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(SIGNUP_ROLES as unknown as string[])
  role!: Role.OrgAdmin | Role.EndUser;

  @IsString()
  organizationSlug!: string;
}
