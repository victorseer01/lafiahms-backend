import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('patient_identifier')
export class PatientIdentifier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => Patient, (patient) => patient.identifiers)
  patient: Patient;

  @Column()
  patientId: string;

  @Column()
  identifier: string;

  @Column('uuid')
  identifierTypeId: string;

  @Column({ default: false })
  preferred: boolean;

  @Column({ type: 'uuid', nullable: true })
  locationId: string;

  @Column({ type: 'uuid' })
  creator: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreated: Date;

  @Column({ default: false })
  voided: boolean;

  @Column({ type: 'uuid', nullable: true })
  voidedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  dateVoided: Date;

  @Column({ nullable: true })
  voidReason: string;
}
