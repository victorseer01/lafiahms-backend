import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { Person } from './entities/person.entity';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { CacheModule } from '../cache/cache.module';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person]),
    AuthModule,
    TenantModule,  // Add TenantModule here
    CacheModule
  ],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: 'persons', method: RequestMethod.ALL });
  }
}