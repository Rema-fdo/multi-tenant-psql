import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { FeatureFlag } from '../feature-flags/feature-flag.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        ssl: config.get<boolean>('database.ssl')
          ? { rejectUnauthorized: false }
          : false,
        entities: [Organization, User, FeatureFlag],
        // Fine for an assignment. A real deployment would use migrations.
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
