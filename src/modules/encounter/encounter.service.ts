// src/modules/encounter/encounter.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Encounter } from './entities/encounter.entity';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { ObservationService } from './observation.service';
import { Tenant } from '../tenant/entities/tenant.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class EncounterService {
  constructor(
    @InjectRepository(Encounter)
    private readonly encounterRepository: Repository<Encounter>,
    private readonly observationService: ObservationService,
    private readonly cacheService: CacheService,
  ) {}

  async create(
    createEncounterDto: CreateEncounterDto,
    tenant: Tenant,
    creator: string,
  ): Promise<Encounter> {
    const queryRunner = this.encounterRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const encounter = this.encounterRepository.create({
        ...createEncounterDto,
        tenant,
        tenantId: tenant.id,
        creator,
      });

      await queryRunner.manager.save(encounter);

      if (createEncounterDto.observations) {
        for (const obsDto of createEncounterDto.observations) {
          await this.observationService.create(
            encounter.id,
            obsDto,
            tenant,
            creator,
            queryRunner.manager,
          );
        }
      }

      await queryRunner.commitTransaction();
      await this.cacheService.invalidateEncounterCache(tenant.id, encounter.id);

      return this.findOne(encounter.id, tenant);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(tenant: Tenant, patientId?: string): Promise<Encounter[]> {
    const cacheKey = `encounters:${tenant.id}:${patientId || 'all'}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const whereClause: any = {
      tenantId: tenant.id,
      voided: false,
    };

    if (patientId) {
      whereClause.patientId = patientId;
    }

    const encounters = await this.encounterRepository.find({
      where: whereClause,
      relations: ['observations'],
    });

    await this.cacheService.set(cacheKey, encounters, 300);
    return encounters;
  }

  async findOne(id: string, tenant: Tenant): Promise<Encounter> {
    const cacheKey = `encounters:${tenant.id}:${id}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const encounter = await this.encounterRepository.findOne({
      where: { id, tenantId: tenant.id, voided: false },
      relations: ['observations'],
    });

    if (!encounter) {
      throw new NotFoundException(`Encounter not found`);
    }

    await this.cacheService.set(cacheKey, encounter, 300);
    return encounter;
  }
}
