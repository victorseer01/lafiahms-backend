import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concept } from './entities/concept.entity';
import { CreateConceptDto } from './dto/create-concept.dto';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { Tenant } from '../tenant/entities/tenant.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ConceptService {
  constructor(
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    private readonly cacheService: CacheService
  ) {}

  async create(createConceptDto: CreateConceptDto, tenant: Tenant, creator: string): Promise<Concept> {
    const concept = this.conceptRepository.create({
      ...createConceptDto,
      tenant,
      tenantId: tenant.id,
      creator
    });

    await this.cacheService.invalidateConceptCache(tenant.id);
    return this.conceptRepository.save(concept);
  }

  async findAll(
    tenant: Tenant,
    page = 1,
    limit = 10,
    search?: string
  ): Promise<{ data: Concept[]; total: number }> {
    const cacheKey = `concepts:${tenant.id}:list:${page}:${limit}:${search}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryBuilder = this.conceptRepository.createQueryBuilder('concept')
      .where('concept.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('concept.retired = :retired', { retired: false });

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(concept.name) LIKE LOWER(:search) OR LOWER(concept.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    const [concepts, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result = { data: concepts, total };
    await this.cacheService.set(cacheKey, result, 300);
    
    return result;
  }

  async findOne(id: string, tenant: Tenant): Promise<Concept> {
    const cacheKey = `concepts:${tenant.id}:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const concept = await this.conceptRepository.findOne({
      where: {
        id,
        tenantId: tenant.id,
        retired: false
      }
    });

    if (!concept) {
      throw new NotFoundException(`Concept with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, concept, 300);
    return concept;
  }

  async update(id: string, updateConceptDto: UpdateConceptDto, tenant: Tenant, updatedBy: string): Promise<Concept> {
    const concept = await this.findOne(id, tenant);

    const updatedConcept = await this.conceptRepository.save({
      ...concept,
      ...updateConceptDto,
      changedBy: updatedBy,
      dateChanged: new Date()
    });

    await this.cacheService.invalidateConceptCache(tenant.id);
    return updatedConcept;
  }

  async remove(id: string, tenant: Tenant, retiredBy: string, retireReason: string): Promise<void> {
    const concept = await this.findOne(id, tenant);

    await this.conceptRepository.save({
      ...concept,
      retired: true,
      retiredBy,
      dateRetired: new Date(),
      retireReason
    });

    await this.cacheService.invalidateConceptCache(tenant.id);
  }

  async findByClass(conceptClass: string, tenant: Tenant): Promise<Concept[]> {
    const cacheKey = `concepts:${tenant.id}:class:${conceptClass}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const concepts = await this.conceptRepository.find({
      where: {
        tenantId: tenant.id,
        conceptClass,
        retired: false
      },
      order: {
        name: 'ASC'
      }
    });

    await this.cacheService.set(cacheKey, concepts, 300);
    return concepts;
  }
}