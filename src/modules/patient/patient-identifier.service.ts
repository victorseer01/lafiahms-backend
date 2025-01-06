import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PatientIdentifier } from './entities/patient-identifier.entity';
import { CreatePatientIdentifierDto } from './dto/create-patient-identifier.dto';
import { Tenant } from '../tenant/entities/tenant.entity';

@Injectable()
export class PatientIdentifierService {
  constructor(
    @InjectRepository(PatientIdentifier)
    private readonly patientIdentifierRepository: Repository<PatientIdentifier>,
  ) {}

  async create(
    patientId: string,
    createPatientIdentifierDto: CreatePatientIdentifierDto,
    tenant: Tenant,
    creator: string,
    entityManager?: EntityManager,
  ): Promise<PatientIdentifier> {
    const repository = entityManager
      ? entityManager.getRepository(PatientIdentifier)
      : this.patientIdentifierRepository;

    const identifier = repository.create({
      ...createPatientIdentifierDto,
      patientId,
      tenant,
      tenantId: tenant.id,
      creator,
    });

    return repository.save(identifier);
  }
}
