// src/modules/person/person.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Tenant } from '../tenant/entities/tenant.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly cacheService: CacheService,
  ) {}

  async create(
    createPersonDto: CreatePersonDto,
    tenant: Tenant,
    creator: string,
    entityManager?: EntityManager,
  ): Promise<Person> {
    const repository = entityManager ? entityManager.getRepository(Person) : this.personRepository;

    const person = repository.create({
      ...createPersonDto,
      tenant,
      tenantId: tenant.id,
      creator,
    });

    const savedPerson = await repository.save(person);
    await this.cacheService.invalidatePersonCache(tenant.id, savedPerson.id);

    return savedPerson;
  }

  async findAll(
    tenant: Tenant,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{ data: Person[]; total: number }> {
    const cacheKey = `persons:${tenant.id}:list:${page}:${limit}:${search || 'all'}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const queryBuilder = this.personRepository
      .createQueryBuilder('person')
      .where('person.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('person.voided = :voided', { voided: false });

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(person.firstName) LIKE LOWER(:search) OR LOWER(person.lastName) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const [persons, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result = { data: persons, total };
    await this.cacheService.set(cacheKey, result, 300); // Cache for 5 minutes

    return result;
  }

  async findOne(id: string, tenant: Tenant): Promise<Person> {
    const cacheKey = `persons:${tenant.id}:${id}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const person = await this.personRepository.findOne({
      where: {
        id,
        tenantId: tenant.id,
        voided: false,
      },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, person, 300);
    return person;
  }

  async update(
    id: string,
    updatePersonDto: UpdatePersonDto,
    tenant: Tenant,
    updatedBy: string,
  ): Promise<Person> {
    const person = await this.findOne(id, tenant);

    const updatedPerson = await this.personRepository.save({
      ...person,
      ...updatePersonDto,
      changedBy: updatedBy,
      dateChanged: new Date(),
    });

    await this.cacheService.invalidatePersonCache(tenant.id, id);
    return updatedPerson;
  }

  async remove(id: string, tenant: Tenant, voidedBy: string): Promise<void> {
    const person = await this.findOne(id, tenant);

    await this.personRepository.save({
      ...person,
      voided: true,
      voidedBy,
      dateVoided: new Date(),
    });

    await this.cacheService.invalidatePersonCache(tenant.id, id);
  }

  async exists(id: string, tenant: Tenant): Promise<boolean> {
    const count = await this.personRepository.count({
      where: {
        id,
        tenantId: tenant.id,
        voided: false,
      },
    });

    return count > 0;
  }
}

// src/modules/person/dto/update-person.dto.ts
