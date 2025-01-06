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
  import { ConceptService } from './concept.service';
  import { CreateConceptDto } from './dto/create-concept.dto';
  import { UpdateConceptDto } from './dto/update-concept.dto';
  import { AuthGuard } from '../auth/guards/auth.guard';
  import { PermissionsGuard } from '../auth/guards/permissions.guard';
  import { Permissions } from '../auth/decorators/permissions.decorator';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { CurrentTenant } from '../../common/decorators/tenant.decorator';
  import { Tenant } from '../tenant/entities/tenant.entity';
  
  @ApiTags('concepts')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Controller('concepts')
  export class ConceptController {
    constructor(private readonly conceptService: ConceptService) {}
  
    @Post()
    @Permissions('create:concepts')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Create a new concept' })
    create(
      @Body() createConceptDto: CreateConceptDto,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.conceptService.create(createConceptDto, tenant, user.id);
    }
  
    @Get()
    @Permissions('read:concepts')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get all concepts' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    findAll(
      @CurrentTenant() tenant: Tenant,
      @Query('page') page = 1,
      @Query('limit') limit = 10,
      @Query('search') search?: string,
    ) {
      return this.conceptService.findAll(tenant, page, limit, search);
    }
  
    @Get(':id')
    @Permissions('read:concepts')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get concept by id' })
    findOne(
      @Param('id') id: string,
      @CurrentTenant() tenant: Tenant,
    ) {
      return this.conceptService.findOne(id, tenant);
    }
  
    @Put(':id')
    @Permissions('update:concepts')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Update concept' })
    update(
      @Param('id') id: string,
      @Body() updateConceptDto: UpdateConceptDto,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.conceptService.update(id, updateConceptDto, tenant, user.id);
    }
  
    @Delete(':id')
    @Permissions('delete:concepts')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Delete concept' })
    remove(
      @Param('id') id: string,
      @Body('reason') reason: string,
      @CurrentTenant() tenant: Tenant,
      @CurrentUser() user: any,
    ) {
      return this.conceptService.remove(id, tenant, user.id, reason);
    }
  
    @Get('class/:className')
    @Permissions('read:concepts')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Get concepts by class' })
    findByClass(
      @Param('className') className: string,
      @CurrentTenant() tenant: Tenant,
    ) {
      return this.conceptService.findByClass(className, tenant);
    }
  }