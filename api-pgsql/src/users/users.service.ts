import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../common/enums/role.enum';

interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: Role;
  organizationId: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  create(input: CreateUserInput): Promise<User> {
    const user = this.users.create({
      ...input,
      email: input.email.toLowerCase(),
    });
    return this.users.save(user);
  }
}
