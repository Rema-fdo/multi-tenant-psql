import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Organization } from './organization.entity';
import { slugify } from '../common/utils/slug';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
  ) {}

  async create(name: string): Promise<Organization> {
    const slug = slugify(name);
    const existing = await this.organizations.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`An organization "${slug}" already exists`);
    }
    const org = this.organizations.create({ name: name.trim(), slug });
    return this.organizations.save(org);
  }

  findAll(): Promise<Organization[]> {
    return this.organizations.find({ order: { createdAt: 'DESC' } });
  }

  // A minimal, unauthenticated view used to populate the sign-up dropdown.
  async listPublic() {
    const orgs = await this.organizations.find({ order: { name: 'ASC' } });
    return orgs.map((org) => ({ id: org.id, name: org.name, slug: org.slug }));
  }

  findBySlug(slug: string): Promise<Organization | null> {
    return this.organizations.findOne({ where: { slug } });
  }

  findById(id: string): Promise<Organization | null> {
    if (!isUUID(id)) return Promise.resolve(null);
    return this.organizations.findOne({ where: { id } });
  }

  // The users and feature_flags foreign keys are ON DELETE CASCADE, so deleting
  // the organization row also removes its admins, end users and flags. Those
  // accounts can then no longer log in.
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new NotFoundException('Organization not found');
    }
    const result = await this.organizations.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Organization not found');
    }
    return { id };
  }
}
