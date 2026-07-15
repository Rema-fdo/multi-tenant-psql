import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SuperAdmin)
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizations.create(dto.name);
  }

  @Get()
  list() {
    return this.organizations.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizations.remove(id);
  }
}
