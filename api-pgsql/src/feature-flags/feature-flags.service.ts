import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { FeatureFlag } from './feature-flag.entity';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectRepository(FeatureFlag)
    private readonly flags: Repository<FeatureFlag>,
  ) {}

  async create(organizationId: string, dto: CreateFeatureFlagDto) {
    const duplicate = await this.flags.findOne({
      where: { organizationId, key: dto.key },
    });
    if (duplicate) {
      throw new ConflictException(`Flag "${dto.key}" already exists`);
    }
    const flag = this.flags.create({
      organizationId,
      key: dto.key,
      description: dto.description ?? '',
      enabled: dto.enabled ?? false,
    });
    return this.flags.save(flag);
  }

  listForOrg(organizationId: string) {
    return this.flags.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateFeatureFlagDto,
  ) {
    const flag = await this.getOwned(organizationId, id);
    if (dto.key !== undefined && dto.key !== flag.key) {
      const duplicate = await this.flags.findOne({
        where: { organizationId, key: dto.key },
      });
      if (duplicate) {
        throw new ConflictException(`Flag "${dto.key}" already exists`);
      }
      flag.key = dto.key;
    }
    if (dto.enabled !== undefined) flag.enabled = dto.enabled;
    if (dto.description !== undefined) flag.description = dto.description;
    return this.flags.save(flag);
  }

  async remove(organizationId: string, id: string) {
    const flag = await this.getOwned(organizationId, id);
    await this.flags.remove(flag);
    return { id };
  }

  // The public question: is this key on for this org? Unknown keys are off.
  async check(organizationId: string, key: string) {
    const flag = await this.flags.findOne({ where: { organizationId, key } });
    return { key, enabled: flag?.enabled ?? false };
  }

  private async getOwned(organizationId: string, id: string) {
    // A malformed id would otherwise throw a Postgres uuid cast error (500);
    // treat it as a plain miss instead.
    const flag = isUUID(id)
      ? await this.flags.findOne({ where: { id } })
      : null;
    // Scope check and existence check are intentionally indistinguishable
    // so an admin can't probe for flag ids in other organizations.
    if (!flag || flag.organizationId !== organizationId) {
      throw new NotFoundException('Feature flag not found');
    }
    return flag;
  }
}
