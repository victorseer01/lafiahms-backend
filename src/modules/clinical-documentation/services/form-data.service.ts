// src/modules/clinical-documentation/services/form-data.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormData } from '../entities/form-data.entity';
import { SubmitFormDto } from '../dto/submit-form.dto';
import { TemplateService } from './tempate.service';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { CacheService } from '../../cache/cache.service';
import { FormValidator } from '../utils/form-validator';
import { FormProcessor } from '../utils/form-processor';
import { FormStatus } from '../enums/form-status.enum';
import { FORM_STATUS_TRANSITIONS } from '../types/form-status.types';

@Injectable()
export class FormDataService {
  constructor(
    @InjectRepository(FormData)
    private readonly formDataRepository: Repository<FormData>,
    private readonly templateService: TemplateService,
    private readonly cacheService: CacheService
  ) {}

  async submit(submitFormDto: SubmitFormDto, tenant: Tenant, creator: string): Promise<FormData> {
    const template = await this.templateService.findOne(submitFormDto.templateId, tenant);
    
    const currentVersion = await this.templateService.getVersion(
      submitFormDto.templateId,
      template.currentVersionId,
      tenant
    );

    // Validate form data against schema
    const validationResult = FormValidator.validateFormData(
      submitFormDto.formData,
      currentVersion.validationSchema
    );

    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Form validation failed',
        errors: validationResult.errors
      });
    }

    // Process form data
    const processedData = FormProcessor.processFormData({
      data: submitFormDto.formData,
      rules: currentVersion.processingRules || []
    });

    const queryRunner = this.formDataRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const formData = this.formDataRepository.create({
        tenant,
        tenantId: tenant.id,
        templateId: submitFormDto.templateId,
        templateVersionId: currentVersion.id,
        patientId: submitFormDto.patientId,
        encounterId: submitFormDto.encounterId,
        formData: processedData,
        status: submitFormDto.status || FormStatus.DRAFT,
        creator
      });

      await queryRunner.manager.save(formData);
      await queryRunner.commitTransaction();

      await this.cacheService.invalidateFormDataCache(tenant.id, formData.id);
      return this.findOne(formData.id, tenant);
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
      patientId?: string;
      templateId?: string;
      encounterId?: string;
      status?: FormStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: FormData[]; total: number }> {
    const { patientId, templateId, encounterId, status, page = 1, limit = 10 } = options;
    
    const cacheKey = `formData:${tenant.id}:list:${JSON.stringify(options)}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryBuilder = this.formDataRepository.createQueryBuilder('formData')
      .leftJoinAndSelect('formData.template', 'template')
      .leftJoinAndSelect('formData.templateVersion', 'templateVersion')
      .where('formData.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('formData.voided = :voided', { voided: false });

    if (patientId) {
      queryBuilder.andWhere('formData.patientId = :patientId', { patientId });
    }

    if (templateId) {
      queryBuilder.andWhere('formData.templateId = :templateId', { templateId });
    }

    if (encounterId) {
      queryBuilder.andWhere('formData.encounterId = :encounterId', { encounterId });
    }

    if (status) {
      queryBuilder.andWhere('formData.status = :status', { status });
    }

    const [forms, total] = await queryBuilder
      .orderBy('formData.dateCreated', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result = { data: forms, total };
    await this.cacheService.set(cacheKey, result, 300);
    
    return result;
  }

  async findOne(id: string, tenant: Tenant): Promise<FormData> {
    const cacheKey = `formData:${tenant.id}:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const formData = await this.formDataRepository.findOne({
      where: {
        id,
        tenantId: tenant.id,
        voided: false
      },
      relations: ['template', 'templateVersion']
    });

    if (!formData) {
      throw new NotFoundException(`Form data with ID "${id}" not found`);
    }

    await this.cacheService.set(cacheKey, formData, 300);
    return formData;
  }

  async updateStatus(
    id: string,
    newStatus: FormStatus,
    tenant: Tenant,
    updatedBy: string
  ): Promise<FormData> {
    const formData = await this.findOne(id, tenant);
    const currentStatus = formData.status as FormStatus;

    if (!this.isValidStatusTransition(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    const updatedFormData = await this.formDataRepository.save({
      ...formData,
      status: newStatus,
      changedBy: updatedBy,
      dateChanged: new Date()
    });

    await this.cacheService.invalidateFormDataCache(tenant.id, id);
    return this.findOne(id, tenant);
  }

  async void(
    id: string,
    reason: string,
    tenant: Tenant,
    voidedBy: string
  ): Promise<void> {
    const formData = await this.findOne(id, tenant);

    await this.formDataRepository.save({
      ...formData,
      voided: true,
      voidedBy,
      dateVoided: new Date(),
      voidReason: reason
    });

    await this.cacheService.invalidateFormDataCache(tenant.id, id);
  }

  private isValidStatusTransition(currentStatus: FormStatus, newStatus: FormStatus): boolean {
    return FORM_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
  }
}