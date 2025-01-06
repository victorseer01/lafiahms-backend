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
  import { EncounterService } from './encounter.service';
  import { CreateEncounterDto } from './dto/create-encounter.dto';
  import { UpdateEncounterDto } from './dto/update-encounter.dto';
  import { AuthGuard } from '../auth/guards/auth.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { CurrentTenant } from '../../common/decorators/tenant.decorator';
  import { Tenant } from '../tenant/entities/tenant.entity';
  
  @ApiTags('encounters')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Controller('encounters')
  export class EncounterController {
    constructor(private readonly encounterService: EncounterService) {}
  
    @Post()
    create(
      @Body() createEncounterDto: CreateEncounterDto,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.encounterService.create(createEncounterDto, tenant, user.id);
    }
  
    @Get()
    @ApiQuery({ name: 'patientId', required: false })
    findAll(
      @CurrentTenant() tenant: Tenant,
      @Query('patientId') patientId?: string,
    ) {
      return this.encounterService.findAll(tenant, patientId);
    }
  
    @Get(':id')
    findOne(
      @Param('id') id: string,
      @CurrentTenant() tenant: Tenant,
    ) {
      return this.encounterService.findOne(id, tenant);
    }
  }