import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { PatientIdentifier } from './patient-identifier.entity';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => Person)
  person: Person;

  @Column()
  personId: string;

  @OneToMany(() => PatientIdentifier, (identifier) => identifier.patient)
  identifiers: PatientIdentifier[];

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
}
