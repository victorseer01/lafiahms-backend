import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { FormComponentType, IValidationRule } from '@/common/interfaces/form-component.interface';

@Entity('form_component')
export class FormComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: FormComponentType
  })
  type: FormComponentType;

  @Column()
  label: string;

  @Column({ default: false })
  required: boolean;

  @Column('jsonb', { nullable: true })
  validation: IValidationRule[];

  @Column('jsonb', { nullable: true })
  properties: Record<string, any>;

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