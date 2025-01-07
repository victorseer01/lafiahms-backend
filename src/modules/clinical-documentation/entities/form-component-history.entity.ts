// src/modules/clinical-documentation/entities/form-component-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { FormComponent } from './form-component.entity';

@Entity('form_component_history')
export class FormComponentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => FormComponent)
  component: FormComponent;

  @Column()
  componentId: string;

  @Column()
  action: string;

  @Column('jsonb')
  changes: Record<string, any>;

  @Column({ nullable: true })
  reason: string;

  @Column({ type: 'uuid' })
  creator: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreated: Date;
}