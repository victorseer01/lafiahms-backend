import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Observation } from './observation.entity';

@Entity('encounter')
export class Encounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => Patient)
  patient: Patient;

  @Column()
  patientId: string;

  @Column('uuid')
  encounterType: string;

  @Column({ type: 'timestamp' })
  encounterDatetime: Date;

  @OneToMany(() => Observation, (observation) => observation.encounter)
  observations: Observation[];

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
