import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './config/configuration';
import { TenantModule } from './modules/tenant/tenant.module';
import { PersonModule } from './modules/person/person.module';
import { PatientModule } from './modules/patient/patient.module';
import { EncounterModule } from './modules/encounter/encounter.module';
import { ConceptModule } from './modules/concept/concept.module';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './modules/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    CacheModule,
    TenantModule,
    PersonModule,
    PatientModule,
    EncounterModule,
    ConceptModule,
    AuthModule,
  ],
})
export class AppModule {}
