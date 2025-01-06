// src/modules/clinical-documentation/controllers/template.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Delete,
    Param,
    Query,
    UseGuards
  } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  import { TemplateService } from '../services/tempate.service';
  import { CreateTemplateDto } from '../dto/create-template.dto';
  import { UpdateTemplateDto } from '../dto/update-template.dto';
  import { AuthGuard } from '../../auth/guards/auth.guard';
  import { PermissionsGuard } from '../../auth/guards/permissions.guard';
  import { Permissions } from '../../auth/decorators/permissions.decorator';
  import { CurrentUser } from '../../../common/decorators/current-user.decorator';
  import { CurrentTenant } from '../../../common/decorators/tenant.decorator';
  import { Tenant } from '../../tenant/entities/tenant.entity';
  
  @ApiTags('clinical-templates')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Controller('clinical-templates')
  export class TemplateController {
    constructor(private readonly templateService: TemplateService) {}
  
    @Post()
    @Permissions('create:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Create a new clinical template' })
    create(
      @Body() createTemplateDto: CreateTemplateDto,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.templateService.create(createTemplateDto, tenant, user.id);
    }
  
    @Get()
    @Permissions('read:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get all clinical templates' })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
      @CurrentTenant() tenant: Tenant,
      @Query('categoryId') categoryId?: string,
      @Query('isPublished') isPublished?: boolean,
      @Query('search') search?: string,
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ) {
      return this.templateService.findAll(tenant, {
        categoryId,
        isPublished,
        search,
        page,
        limit,
      });
    }
  
    @Get(':id')
    @Permissions('read:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get template by id' })
    findOne(
      @Param('id') id: string,
      @CurrentTenant() tenant: Tenant,
    ) {
      return this.templateService.findOne(id, tenant);
    }
  
    @Get(':id/versions/:versionId')
    @Permissions('read:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get specific template version' })
    getVersion(
      @Param('id') id: string,
      @Param('versionId') versionId: string,
      @CurrentTenant() tenant: Tenant,
    ) {
      return this.templateService.getVersion(id, versionId, tenant);
    }
  
    @Post(':id/versions')
    @Permissions('update:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Create new template version' })
    createVersion(
      @Param('id') id: string,
      @Body() versionData: CreateTemplateDto['version'],
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.templateService.createNewVersion(id, versionData, tenant, user.id);
    }
  
    @Put(':id')
    @Permissions('update:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Update template' })
    update(
      @Param('id') id: string,
      @Body() updateTemplateDto: UpdateTemplateDto,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.templateService.update(id, updateTemplateDto, tenant, user.id);
    }
  
    @Delete(':id')
    @Permissions('delete:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Delete template' })
    remove(
      @Param('id') id: string,
      @Body('reason') reason: string,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.templateService.remove(id, tenant, user.id, reason);
    }
  
    @Post(':id/publish')
    @Permissions('publish:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Publish template' })
    publish(
      @Param('id') id: string,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.templateService.publish(id, tenant, user.id);
    }
  
    @Post(':id/unpublish')
    @Permissions('publish:templates')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Unpublish template' })
    unpublish(
      @Param('id') id: string,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.templateService.unpublish(id, tenant, user.id);
    }
  }