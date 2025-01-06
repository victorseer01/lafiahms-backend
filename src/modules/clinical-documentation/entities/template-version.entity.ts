// src/modules/clinical-documentation/entities/template-version.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ClinicalTemplate } from './template.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('clinical_template_version')
export class TemplateVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => ClinicalTemplate, template => template.versions)
  template: ClinicalTemplate;

  @Column()
  templateId: string;

  @Column()
  version: number;

  @Column('jsonb')
  schema: any;

  @Column('jsonb', { nullable: true })
  uiSchema: any;

  @Column('jsonb')
  validationSchema: any;

  @Column('jsonb', { nullable: true })
  processingRules: any;  // Added this field

  @Column({ type: 'uuid' })
  creator: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreated: Date;

  @Column({ nullable: true })
  changeReason: string;
}