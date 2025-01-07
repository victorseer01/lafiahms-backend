import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('person')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ default: false })
  birthdateEstimated: boolean;

  @Column({ default: false })
  dead: boolean;

  @Column({ type: 'date', nullable: true })
  deathDate: Date;

  @Column({ type: 'uuid', nullable: true })
  causeOfDeath: string;

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
