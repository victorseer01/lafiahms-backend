import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptController } from './concept.controller';
import { ConceptService } from './concept.service';
import { Concept } from './entities/concept.entity';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Concept]),
    AuthModule,
    CacheModule
  ],
  controllers: [ConceptController],
  providers: [ConceptService],
  exports: [ConceptService],
})
export class ConceptModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: 'concepts', method: RequestMethod.ALL });
  }
}