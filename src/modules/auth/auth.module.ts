import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuditLog } from './entities/audit-log.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('LAFIA_AUTH_URL'),
        timeout: 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AuditLog]),
    CacheModule,
  ],
  providers: [
    AuthService,
    AuthGuard,
    PermissionsGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    AuthGuard,
    PermissionsGuard,
    RolesGuard,
  ],
})
export class AuthModule {}