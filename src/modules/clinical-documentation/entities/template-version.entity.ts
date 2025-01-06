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
  schema: any;  // Form schema definition

  @Column('jsonb', { nullable: true })
  uiSchema: any;  // UI rendering hints

  @Column('jsonb')
  validationSchema: any;  // JSON Schema for validation

  @Column({ type: 'uuid' })
  creator: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreated: Date;

  @Column({ nullable: true })
  changeReason: string;
}