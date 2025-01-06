// src/modules/patient/patient.controller.ts
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
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { SearchPatientsDto } from './dto/search-patients.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Tenant } from '../tenant/entities/tenant.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: any,
  ) {
    return this.patientService.create(createPatientDto, tenant, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Search patients' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentTenant() tenant: Tenant,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() search: SearchPatientsDto,
  ) {
    return this.patientService.findAll(tenant, {
      page,
      limit,
      search
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by id' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: Tenant,
  ) {
    return this.patientService.findOne(id, tenant);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: any,
  ) {
    return this.patientService.update(id, updatePatientDto, tenant, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient' })
  remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: any,
  ) {
    return this.patientService.remove(id, tenant, user.id);
  }
}