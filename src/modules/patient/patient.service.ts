import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientIdentifierService } from './patient-identifier.service';
import { PersonService } from '../person/person.service';
import { Tenant } from '../tenant/entities/tenant.entity';
import { CacheService } from '../cache/cache.service';
import { SearchPatientsDto } from './dto/search-patients.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly personService: PersonService,
    private readonly patientIdentifierService: PatientIdentifierService,
    private readonly cacheService: CacheService
  ) {}

  async create(createPatientDto: CreatePatientDto, tenant: Tenant, creator: string): Promise<Patient> {
    const queryRunner = this.patientRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let personId = createPatientDto.personId;
      
      if (!personId && createPatientDto.person) {
        const person = await this.personService.create(createPatientDto.person, tenant, creator);
        personId = person.id;
      }

      const patient = this.patientRepository.create({
        personId,
        tenant,
        tenantId: tenant.id,
        creator
      });

      await queryRunner.manager.save(patient);

      if (createPatientDto.identifiers) {
        for (const identifierDto of createPatientDto.identifiers) {
          await this.patientIdentifierService.create(
            patient.id,
            identifierDto,
            tenant,
            creator,
            queryRunner.manager
          );
        }
      }

      await queryRunner.commitTransaction();
      await this.cacheService.invalidatePatientCache(tenant.id, patient.id);
      
      return this.findOne(patient.id, tenant);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    tenant: Tenant,
    options: {
      page?: number;
      limit?: number;
      search?: SearchPatientsDto;
    }
  ): Promise<{ data: Patient[]; total: number }> {
    const { page = 1, limit = 10, search } = options;
    
    const cacheKey = `patients:${tenant.id}:list:${page}:${limit}:${JSON.stringify(search)}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.person', 'person')
      .leftJoinAndSelect('patient.identifiers', 'identifier')
      .where('patient.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('patient.voided = :voided', { voided: false });

    if (search) {
      if (search.identifier) {
        queryBuilder.andWhere('identifier.identifier ILIKE :identifier', {
          identifier: `%${search.identifier}%`
        });
      }

      if (search.firstName) {
        queryBuilder.andWhere('person.firstName ILIKE :firstName', {
          firstName: `%${search.firstName}%`
        });
      }

      // ... rest of search conditions ...
    }

    const [patients, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result = { data: patients, total };
    await this.cacheService.set(cacheKey, result, 300);
    
    return result;
  }



  async findOne(id: string, tenant: Tenant): Promise<Patient> {
    const cacheKey = `patients:${tenant.id}:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const patient = await this.patientRepository.findOne({
      where: { id, tenantId: tenant.id, voided: false },
      relations: ['person', 'identifiers']
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, patient, 300);
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto, tenant: Tenant, updatedBy: string): Promise<Patient> {
    const queryRunner = this.patientRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const patient = await this.findOne(id, tenant);

      // Update person if provided
      if (updatePatientDto.person && patient.personId) {
        await this.personService.update(patient.personId, updatePatientDto.person, tenant, updatedBy);
      }

      await queryRunner.manager.save(Patient, {
        ...patient,
        changedBy: updatedBy,
        dateChanged: new Date()
      });

      // Update identifiers if provided
      if (updatePatientDto.identifiers) {
        // First void existing identifiers
        await queryRunner.manager.update(
          'patient_identifier',
          { patientId: id, voided: false },
          { 
            voided: true,
            voidedBy: updatedBy,
            dateVoided: new Date()
          }
        );

        // Then create new identifiers
        for (const identifierDto of updatePatientDto.identifiers) {
          await this.patientIdentifierService.create(
            id,
            identifierDto,
            tenant,
            updatedBy,
            queryRunner.manager
          );
        }
      }

      await queryRunner.commitTransaction();
      await this.cacheService.invalidatePatientCache(tenant.id, id);

      return this.findOne(id, tenant);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, tenant: Tenant, voidedBy: string): Promise<void> {
    const queryRunner = this.patientRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const patient = await this.findOne(id, tenant);

      // Void patient
      await queryRunner.manager.update(
        Patient,
        { id },
        {
          voided: true,
          voidedBy,
          dateVoided: new Date()
        }
      );

      // Void identifiers
      await queryRunner.manager.update(
        'patient_identifier',
        { patientId: id, voided: false },
        {
          voided: true,
          voidedBy,
          dateVoided: new Date()
        }
      );

      // Void person
      if (patient.personId) {
        await this.personService.remove(patient.personId, tenant, voidedBy);
      }

      await queryRunner.commitTransaction();
      await this.cacheService.invalidatePatientCache(tenant.id, id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}