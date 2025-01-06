import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Encounter } from './encounter.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('observation')
export class Observation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => Encounter, (encounter) => encounter.observations)
  encounter: Encounter;

  @Column()
  encounterId: string;

  @Column('uuid')
  conceptId: string;

  @Column({ type: 'timestamp' })
  observationDatetime: Date;

  @Column({ type: 'text', nullable: true })
  valueText: string;

  @Column({ type: 'float', nullable: true })
  valueNumeric: number;

  @Column({ type: 'uuid', nullable: true })
  valueCoded: string;

  @Column({ type: 'timestamp', nullable: true })
  valueDatetime: Date;

  @Column({ type: 'uuid' })
  creator: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreated: Date;
}
