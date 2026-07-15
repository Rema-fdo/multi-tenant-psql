import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlag } from './feature-flag.entity';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlagsController } from './feature-flags.controller';
import { FeaturesController } from './features.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlag])],
  providers: [FeatureFlagsService],
  controllers: [FeatureFlagsController, FeaturesController],
})
export class FeatureFlagsModule {}
