import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/jwt-payload';

@Controller('feature-flags')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OrgAdmin)
export class FeatureFlagsController {
  constructor(private readonly flags: FeatureFlagsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFeatureFlagDto) {
    return this.flags.create(user.organizationId!, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.flags.listForOrg(user.organizationId!);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateFeatureFlagDto,
  ) {
    return this.flags.update(user.organizationId!, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.flags.remove(user.organizationId!, id);
  }
}
