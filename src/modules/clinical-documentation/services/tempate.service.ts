import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalTemplate } from '../entities/template.entity';
import { TemplateVersion } from '../entities/template-version.entity';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(ClinicalTemplate)
    private readonly templateRepository: Repository<ClinicalTemplate>,
    @InjectRepository(TemplateVersion)
    private readonly versionRepository: Repository<TemplateVersion>,
    private readonly cacheService: CacheService
  ) {}

  async create(createTemplateDto: CreateTemplateDto, tenant: Tenant, creator: string): Promise<ClinicalTemplate> {
    const queryRunner = this.templateRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create template
      const template = this.templateRepository.create({
        ...createTemplateDto,
        tenant,
        tenantId: tenant.id,
        creator
      });

      await queryRunner.manager.save(template);

      // Create initial version
      const version = this.versionRepository.create({
        tenant,
        tenantId: tenant.id,
        template,
        templateId: template.id,
        version: 1,
        schema: createTemplateDto.version.schema,
        uiSchema: createTemplateDto.version.uiSchema,
        validationSchema: createTemplateDto.version.validationSchema,
        creator
      });

      await queryRunner.manager.save(version);

      // Update template with current version
      template.currentVersionId = version.id;
      await queryRunner.manager.save(template);

      await queryRunner.commitTransaction();
      await this.cacheService.invalidateTemplateCache(tenant.id, template.id);

      return this.findOne(template.id, tenant);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createNewVersion(
    templateId: string,
    versionData: CreateTemplateDto['version'],
    tenant: Tenant,
    creator: string
  ): Promise<TemplateVersion> {
    const template = await this.findOne(templateId, tenant);
    const latestVersion = await this.getLatestVersion(templateId, tenant);

    const newVersion = this.versionRepository.create({
      tenant,
      tenantId: tenant.id,
      template,
      templateId,
      version: latestVersion.version + 1,
      schema: versionData.schema,
      uiSchema: versionData.uiSchema,
      validationSchema: versionData.validationSchema,
      changeReason: versionData.changeReason,
      creator
    });

    await this.versionRepository.save(newVersion);
    
    // Update template's current version
    template.currentVersionId = newVersion.id;
    await this.templateRepository.save(template);

    await this.cacheService.invalidateTemplateCache(tenant.id, templateId);
    return newVersion;
  }

  async findAll(
    tenant: Tenant,
    options: {
      categoryId?: string;
      isPublished?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: ClinicalTemplate[]; total: number }> {
    const { categoryId, isPublished, search, page = 1, limit = 10 } = options;

    const cacheKey = `templates:${tenant.id}:list:${JSON.stringify(options)}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryBuilder = this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.category', 'category')
      .leftJoinAndSelect('template.versions', 'versions')
      .where('template.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('template.retired = :retired', { retired: false });

    if (categoryId) {
      queryBuilder.andWhere('template.categoryId = :categoryId', { categoryId });
    }

    if (isPublished !== undefined) {
      queryBuilder.andWhere('template.isPublished = :isPublished', { isPublished });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(template.name) LIKE LOWER(:search) OR LOWER(template.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    const [templates, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result = { data: templates, total };
    await this.cacheService.set(cacheKey, result, 300);
    
    return result;
  }

  async findOne(id: string, tenant: Tenant): Promise<ClinicalTemplate> {
    const cacheKey = `templates:${tenant.id}:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const template = await this.templateRepository.findOne({
      where: {
        id,
        tenantId: tenant.id,
        retired: false
      },
      relations: ['category', 'versions']
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    await this.cacheService.set(cacheKey, template, 300);
    return template;
  }

  async getVersion(templateId: string, versionId: string, tenant: Tenant): Promise<TemplateVersion> {
    const cacheKey = `templates:${tenant.id}:${templateId}:version:${versionId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const version = await this.versionRepository.findOne({
      where: {
        id: versionId,
        templateId,
        tenantId: tenant.id
      }
    });

    if (!version) {
      throw new NotFoundException(`Template version not found`);
    }

    await this.cacheService.set(cacheKey, version, 300);
    return version;
  }

  async getLatestVersion(templateId: string, tenant: Tenant): Promise<TemplateVersion> {
    const version = await this.versionRepository.findOne({
      where: {
        templateId,
        tenantId: tenant.id
      },
      order: {
        version: 'DESC'
      }
    });

    if (!version) {
      throw new NotFoundException(`No versions found for template`);
    }

    return version;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto, tenant: Tenant, updatedBy: string): Promise<ClinicalTemplate> {
    const template = await this.findOne(id, tenant);

    // If there's a new version in the update
    if (updateTemplateDto.version) {
      await this.createNewVersion(id, updateTemplateDto.version, tenant, updatedBy);
    }

    // Update template metadata
    const updatedTemplate = await this.templateRepository.save({
      ...template,
      ...updateTemplateDto,
      version: undefined,  // Remove version from update
      changedBy: updatedBy,
      dateChanged: new Date()
    });

    await this.cacheService.invalidateTemplateCache(tenant.id, id);
    return this.findOne(id, tenant);
  }

  async remove(id: string, tenant: Tenant, retiredBy: string, retireReason: string): Promise<void> {
    const template = await this.findOne(id, tenant);

    await this.templateRepository.save({
      ...template,
      retired: true,
      retiredBy,
      dateRetired: new Date(),
      retireReason
    });

    await this.cacheService.invalidateTemplateCache(tenant.id, id);
  }

  async publish(id: string, tenant: Tenant, updatedBy: string): Promise<ClinicalTemplate> {
    const template = await this.findOne(id, tenant);

    if (template.isPublished) {
      throw new ConflictException('Template is already published');
    }

    const updatedTemplate = await this.templateRepository.save({
      ...template,
      isPublished: true,
      changedBy: updatedBy,
      dateChanged: new Date()
    });

    await this.cacheService.invalidateTemplateCache(tenant.id, id);
    return this.findOne(id, tenant);
  }

  async unpublish(id: string, tenant: Tenant, updatedBy: string): Promise<ClinicalTemplate> {
    const template = await this.findOne(id, tenant);

    if (!template.isPublished) {
      throw new ConflictException('Template is not published');
    }

    const updatedTemplate = await this.templateRepository.save({
      ...template,
      isPublished: false,
      changedBy: updatedBy,
      dateChanged: new Date()
    });

    await this.cacheService.invalidateTemplateCache(tenant.id, id);
    return this.findOne(id, tenant);
  }
}