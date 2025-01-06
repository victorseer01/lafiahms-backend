import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { ClinicalTemplate } from './template.entity';
import { TemplateVersion } from './template-version.entity';
import { Patient } from '../../patient/entities/patient.entity';
import { Encounter } from '../../encounter/entities/encounter.entity';
import { FormStatus } from '../enums/form-status.enum';

@Entity('clinical_form_data')
export class FormData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => ClinicalTemplate)
  template: ClinicalTemplate;

  @Column()
  templateId: string;

  @ManyToOne(() => TemplateVersion)
  templateVersion: TemplateVersion;

  @Column()
  templateVersionId: string;

  @ManyToOne(() => Patient)
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Encounter, { nullable: true })
  encounter: Encounter;

  @Column({ nullable: true })
  encounterId: string;

  @Column('jsonb')
  formData: any;

  @Column({ type: 'uuid' })
  creator: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreated: Date;

  @Column({ type: 'uuid', nullable: true })
  changedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  dateChanged: Date;

  @Column({ default: false })
  voided: boolean;

  @Column({ type: 'uuid', nullable: true })
  voidedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  dateVoided: Date;

  @Column({ nullable: true })
  voidReason: string;

  @Column({
    type: 'enum',
    enum: FormStatus,
    default: FormStatus.DRAFT
  })
  status: string;
}