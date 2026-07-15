import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { CheckFeatureDto } from './dto/check-feature.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/jwt-payload';

// End users only ever ask "is this on for me", scoped to their own org.
@Controller('features')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EndUser)
export class FeaturesController {
  constructor(private readonly flags: FeatureFlagsService) {}

  @Post('check')
  @HttpCode(HttpStatus.OK)
  check(@CurrentUser() user: AuthUser, @Body() dto: CheckFeatureDto) {
    return this.flags.check(user.organizationId!, dto.key);
  }
}
