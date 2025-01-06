import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('concept')
export class Concept {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  datatype: string;  // e.g., 'Numeric', 'Text', 'Coded', 'Date', etc.

  @Column()
  conceptClass: string;  // e.g., 'Finding', 'Diagnosis', 'Symptom', etc.

  @Column({ default: false })
  isSet: boolean;

  @Column('uuid', { array: true, nullable: true })
  setMembers: string[];

  @Column({ type: 'uuid' })
  creator: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreated: Date;

  @Column({ type: 'uuid', nullable: true })
  changedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  dateChanged: Date;

  @Column({ default: false })
  retired: boolean;

  @Column({ type: 'uuid', nullable: true })
  retiredBy: string;

  @Column({ type: 'timestamp', nullable: true })
  dateRetired: Date;

  @Column({ nullable: true })
  retireReason: string;
}