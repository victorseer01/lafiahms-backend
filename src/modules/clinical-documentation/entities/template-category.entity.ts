import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { ClinicalTemplate } from './template.entity';

@Entity('clinical_template_category')
export class TemplateCategory {
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

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => ClinicalTemplate, template => template.category)
  templates: ClinicalTemplate[];

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