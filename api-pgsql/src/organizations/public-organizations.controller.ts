import { Controller, Get } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

// Public so the sign-up screens can show a list of organizations to join.
// Only non-sensitive fields (name, slug) are exposed.
@Controller('public/organizations')
export class PublicOrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get()
  list() {
    return this.organizations.listPublic();
  }
}
