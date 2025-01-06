import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';

@Global()  // Make the module global
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    AuthModule,
    CacheModule
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],  // Make sure to export TenantService
})
export class TenantModule {}