import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncounterController } from './encounter.controller';
import { EncounterService } from './encounter.service';
import { ObservationService } from './observation.service';
import { Encounter } from './entities/encounter.entity';
import { Observation } from './entities/observation.entity';
import { CacheModule } from '../cache/cache.module';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Encounter, Observation]),
    AuthModule,
    CacheModule
  ],
  controllers: [EncounterController],
  providers: [EncounterService, ObservationService],
  exports: [EncounterService, ObservationService],
})
export class EncounterModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: 'encounters', method: RequestMethod.ALL });
  }
}