import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization } from '../organizations/organization.entity';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from './types/jwt-payload';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly organizations: OrganizationsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  superAdminLogin(dto: SuperAdminLoginDto) {
    const expectedUser = this.config.get<string>('superAdmin.username');
    const expectedPass = this.config.get<string>('superAdmin.password');
    if (dto.username !== expectedUser || dto.password !== expectedPass) {
      throw new UnauthorizedException('Invalid super admin credentials');
    }
    const token = this.sign({ sub: 'super-admin', role: Role.SuperAdmin });
    return { token, role: Role.SuperAdmin };
  }

  async signup(dto: SignupDto) {
    const org = await this.organizations.findBySlug(dto.organizationSlug);
    if (!org) {
      throw new NotFoundException(
        `No organization found for "${dto.organizationSlug}"`,
      );
    }

    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('That email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      organizationId: org.id,
    });

    return this.issueUserToken(user, org);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const org = await this.organizations.findById(user.organizationId);
    return this.issueUserToken(user, org);
  }

  private issueUserToken(user: User, org: Organization | null) {
    const token = this.sign({
      sub: user.id,
      role: user.role,
      organizationId: user.organizationId,
      email: user.email,
    });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: org?.name ?? null,
        organizationSlug: org?.slug ?? null,
      },
    };
  }

  private sign(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }
}
