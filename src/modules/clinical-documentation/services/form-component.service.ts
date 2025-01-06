import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormComponent } from '../entities/form-component.entity';
import { CreateFormComponentDto } from '../dto/create-form-component.dto';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { CacheService } from '@/modules/cache/cache.service';

@Injectable()
export class FormComponentService {
  constructor(
    @InjectRepository(FormComponent)
    private readonly componentRepository: Repository<FormComponent>,
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
    await this.cacheService.delPattern(`formComponents:${tenant.id}:*`);

    return component;
  }

  async findAll(tenant: Tenant): Promise<FormComponent[]> {
    const cacheKey = `formComponents:${tenant.id}:list`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const components = await this.componentRepository.find({
      where: {
        tenantId: tenant.id,
        retired: false
      }
    });

    await this.cacheService.set(cacheKey, components, 300);
    return components;
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

  async remove(id: string, tenant: Tenant, retiredBy: string, retireReason: string): Promise<void> {
    const component = await this.findOne(id, tenant);

    await this.componentRepository.save({
      ...component,
      retired: true,
      retiredBy,
      dateRetired: new Date(),
      retireReason
    });

    await this.cacheService.delPattern(`formComponents:${tenant.id}:*`);
  }
}