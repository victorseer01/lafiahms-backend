import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { PatientIdentifierService } from './patient-identifier.service';
import { Patient } from './entities/patient.entity';
import { PatientIdentifier } from './entities/patient-identifier.entity';
import { PersonModule } from '../person/person.module';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, PatientIdentifier]),
    PersonModule,
    AuthModule,  // Add AuthModule here
    CacheModule
  ],
  controllers: [PatientController],
  providers: [
    PatientService, 
    PatientIdentifierService
  ],
  exports: [
    PatientService, 
    PatientIdentifierService
  ],
})
export class PatientModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: 'patients', method: RequestMethod.ALL });
  }
}