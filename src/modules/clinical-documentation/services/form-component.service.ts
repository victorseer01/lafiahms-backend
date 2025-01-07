// src/modules/clinical-documentation/services/form-component.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormComponent } from '../entities/form-component.entity';
import { FormComponentHistory } from '../entities/form-component-history.entity';
import { CreateFormComponentDto } from '../dto/create-form-component.dto';
import { UpdateFormComponentDto } from '../dto/update-form-component.dto';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { CacheService } from '../../cache/cache.service';
import { FormComponentType } from '../enums/form-component.enum';

@Injectable()
export class FormComponentService {
  constructor(
    @InjectRepository(FormComponent)
    private readonly componentRepository: Repository<FormComponent>,
    @InjectRepository(FormComponentHistory)
    private readonly historyRepository: Repository<FormComponentHistory>,
    private readonly cacheService: CacheService
  ) {}

  async create(createComponentDto: CreateFormComponentDto, tenant: Tenant, creator: string): Promise<FormComponent> {
    const component = this.componentRepository.create({
      ...createComponentDto,
      tenant,
      tenantId: tenant.id,
      creator
    });

    await this.componentRepository.save(component);
    await this.createHistory(component, 'CREATE', creator, tenant);
    await this.cacheService.delPattern(`formComponents:${tenant.id}:*`);

    return component;
  }

  async findAll(
    tenant: Tenant,
    options: {
      type?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: FormComponent[]; total: number }> {
    const { type, search, page = 1, limit = 10 } = options;
    const cacheKey = `formComponents:${tenant.id}:list:${JSON.stringify(options)}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryBuilder = this.componentRepository.createQueryBuilder('component')
      .where('component.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('component.retired = :retired', { retired: false });

    if (type) {
      queryBuilder.andWhere('component.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(component.label) LIKE LOWER(:search) OR LOWER(component.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result = { data, total };
    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  async findOne(id: string, tenant: Tenant): Promise<FormComponent> {
    const cacheKey = `formComponents:${tenant.id}:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const component = await this.componentRepository.findOne({
      where: {
        id,
        tenantId: tenant.id,
        retired: false
      }
    });

    if (!component) {
      throw new NotFoundException(`Form component with ID "${id}" not found`);
    }

    await this.cacheService.set(cacheKey, component, 300);
    return component;
  }

  async update(
    id: string,
    updateComponentDto: UpdateFormComponentDto,
    tenant: Tenant,
    updatedBy: string
  ): Promise<FormComponent> {
    const component = await this.findOne(id, tenant);

    const updatedComponent = await this.componentRepository.save({
      ...component,
      ...updateComponentDto,
      changedBy: updatedBy,
      dateChanged: new Date()
    });

    await this.createHistory(updatedComponent, 'UPDATE', updatedBy, tenant);
    await this.cacheService.delPattern(`formComponents:${tenant.id}:*`);

    return this.findOne(id, tenant);
  }

  async remove(id: string, tenant: Tenant, retiredBy: string, reason: string): Promise<void> {
    const component = await this.findOne(id, tenant);

    await this.componentRepository.save({
      ...component,
      retired: true,
      retiredBy,
      dateRetired: new Date(),
      retireReason: reason
    });

    await this.createHistory(component, 'RETIRE', retiredBy, tenant, reason);
    await this.cacheService.delPattern(`formComponents:${tenant.id}:*`);
  }

  async getComponentTypes(): Promise<FormComponentType[]> {
    return Promise.resolve(Object.values(FormComponentType));
  }

  async getHistory(
    id: string,
    tenant: Tenant,
    page = 1,
    limit = 10
  ): Promise<{ data: FormComponentHistory[]; total: number }> {
    const [data, total] = await this.historyRepository.findAndCount({
      where: {
        componentId: id,
        tenantId: tenant.id
      },
      order: {
        dateCreated: 'DESC'
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  private async createHistory(
    component: FormComponent,
    action: string,
    creator: string,
    tenant: Tenant,
    reason?: string
  ): Promise<void> {
    const history = this.historyRepository.create({
      componentId: component.id,
      tenant,
      tenantId: tenant.id,
      action,
      changes: component,
      creator,
      reason
    });

    await this.historyRepository.save(history);
  }
}