import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Put
  } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  import { FormDataService } from '../services/form-data.service';
  import { SubmitFormDto } from '../dto/submit-form.dto';
  import { UpdateFormStatusDto } from '../dto/update-form-status.dto';
  import { AuthGuard } from '../../auth/guards/auth.guard';
  import { PermissionsGuard } from '../../auth/guards/permissions.guard';
  import { Permissions } from '../../auth/decorators/permissions.decorator';
  import { CurrentUser } from '../../../common/decorators/current-user.decorator';
  import { CurrentTenant } from '../../../common/decorators/tenant.decorator';
  import { Tenant } from '../../tenant/entities/tenant.entity';
  
  @ApiTags('clinical-forms')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Controller('clinical-forms')
  export class FormController {
    constructor(private readonly formDataService: FormDataService) {}
  
    @Post()
    @Permissions('create:forms')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Submit a clinical form' })
    submit(
      @Body() submitFormDto: SubmitFormDto,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.formDataService.submit(submitFormDto, tenant, user.id);
    }
  
    @Get()
    @Permissions('read:forms')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get all form submissions' })
    @ApiQuery({ name: 'patientId', required: false })
    @ApiQuery({ name: 'templateId', required: false })
    @ApiQuery({ name: 'encounterId', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
      @CurrentTenant() tenant: Tenant,
      @Query('patientId') patientId?: string,
      @Query('templateId') templateId?: string,
      @Query('encounterId') encounterId?: string,
      @Query('status') status?: string,
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ) {
      return this.formDataService.findAll(tenant, {
        patientId,
        templateId,
        encounterId,
        status,
        page,
        limit,
      });
    }
  
    @Get(':id')
    @Permissions('read:forms')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get form submission by id' })
    findOne(
      @Param('id') id: string,
      @CurrentTenant() tenant: Tenant,
    ) {
      return this.formDataService.findOne(id, tenant);
    }
  
    @Put(':id/status')
    @Permissions('update:forms')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Update form status' })
    updateStatus(
      @Param('id') id: string,
      @Body() updateFormStatusDto: UpdateFormStatusDto,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.formDataService.updateStatus(id, updateFormStatusDto.status, tenant, user.id);
    }
  
    @Post(':id/void')
    @Permissions('delete:forms')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Void form submission' })
    void(
      @Param('id') id: string,
      @Body('reason') reason: string,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.formDataService.void(id, reason, tenant, user.id);
    }
  
    @Get('patient/:patientId')
    @Permissions('read:forms')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get patient forms' })
    getPatientForms(
      @Param('patientId') patientId: string,
      @CurrentTenant() tenant: Tenant,
      @Query('status') status?: string,
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ) {
      return this.formDataService.findAll(tenant, {
        patientId,
        status,
        page,
        limit,
      });
    }
  }