import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Observation } from './entities/observation.entity';
import { CreateObservationDto } from './dto/create-observation.dto';
import { Tenant } from '../tenant/entities/tenant.entity';

@Injectable()
export class ObservationService {
  constructor(
    @InjectRepository(Observation)
    private readonly observationRepository: Repository<Observation>,
  ) {}

  async create(
    encounterId: string,
    createObservationDto: CreateObservationDto,
    tenant: Tenant,
    creator: string,
    entityManager?: EntityManager,
  ): Promise<Observation> {
    const repository = entityManager
      ? entityManager.getRepository(Observation)
      : this.observationRepository;

    const observation = repository.create({
      ...createObservationDto,
      encounterId,
      tenant,
      tenantId: tenant.id,
      creator,
    });

    return repository.save(observation);
  }
}
