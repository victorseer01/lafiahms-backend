import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { TemplateVersion } from './template-version.entity';
import { TemplateCategory } from './template-category.entity';

@Entity('clinical_template')
export class ClinicalTemplate {
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

  @ManyToOne(() => TemplateCategory)
  category: TemplateCategory;

  @Column()
  categoryId: string;

  @Column({ default: false })
  isPublished: boolean;

  @OneToMany(() => TemplateVersion, version => version.template)
  versions: TemplateVersion[];

  @Column()
  currentVersionId: string;

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