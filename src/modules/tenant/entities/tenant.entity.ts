import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  domain: string;

  @Column({ nullable: true })
  implementationId: string;

  @Column()
  subscriptionPlan: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 'active' })
  status: string;
}
