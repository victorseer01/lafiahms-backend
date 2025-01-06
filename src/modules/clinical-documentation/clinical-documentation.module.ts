import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateController } from './controllers/template.controller';
import { FormController } from './controllers/form.controller';
import { TemplateService } from './services/tempate.service';
import { FormDataService } from './services/form-data.service';
import { ClinicalTemplate } from './entities/template.entity';
import { TemplateVersion } from './entities/template-version.entity';
import { TemplateCategory } from './entities/template-category.entity';
import { FormData } from './entities/form-data.entity';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { TenantModule } from '../tenant/tenant.module';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        ClinicalTemplate,
        TemplateVersion,
        TemplateCategory,
        FormData,
      ]),
      AuthModule,
      CacheModule,
      TenantModule,
    ],
    controllers: [
      TemplateController,
      FormController
    ],
    providers: [
      TemplateService,
      FormDataService
    ],
    exports: [
      TemplateService,
      FormDataService
    ],
  })
  export class ClinicalDocumentationModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(TenantMiddleware)
        .forRoutes(
          { path: 'clinical-templates', method: RequestMethod.ALL },
          { path: 'clinical-forms', method: RequestMethod.ALL }
        );
    }
  }