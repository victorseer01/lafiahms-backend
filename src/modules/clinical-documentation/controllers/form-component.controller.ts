// src/modules/clinical-documentation/controllers/form-component.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FormComponentService } from '../services/form-component.service';
import { CreateFormComponentDto } from '../dto/create-form-component.dto';
import { UpdateFormComponentDto } from '../dto/update-form-component.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../../common/decorators/tenant.decorator';
import { Tenant } from '../../tenant/entities/tenant.entity';

@ApiTags('form-components')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('form-components')
export class FormComponentController {
  constructor(private readonly formComponentService: FormComponentService) {}

  @Post()
  @Permissions('create:form-components')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Create a new form component' })
  async create(
    @Body() createComponentDto: CreateFormComponentDto,
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: any,
  ) {
    return this.formComponentService.create(createComponentDto, tenant, user.id);
  }

  @Get()
  @Permissions('read:form-components')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all form components' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentTenant() tenant: Tenant,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.formComponentService.findAll(tenant, {
      type,
      search,
      page,
      limit
    });
  }

  @Get(':id')
  @Permissions('read:form-components')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get form component by id' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: Tenant,
  ) {
    return this.formComponentService.findOne(id, tenant);
  }

  @Put(':id')
  @Permissions('update:form-components')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update form component' })
  async update(
    @Param('id') id: string,
    @Body() updateComponentDto: UpdateFormComponentDto,
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: any,
  ) {
    return this.formComponentService.update(id, updateComponentDto, tenant, user.id);
  }

  @Delete(':id')
  @Permissions('delete:form-components')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Delete form component' })
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: any,
    @Body('reason') reason: string,
  ) {
    return this.formComponentService.remove(id, tenant, user.id, reason);
  }

  @Get('types')
  @Permissions('read:form-components')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all form component types' })
  async getComponentTypes() {
    return this.formComponentService.getComponentTypes();
  }

  @Get(':id/history')
  @Permissions('read:form-components')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get form component history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Param('id') id: string,
    @CurrentTenant() tenant: Tenant,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.formComponentService.getHistory(id, tenant, page, limit);
  }
}