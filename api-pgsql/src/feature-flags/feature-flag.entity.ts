import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Organization } from '../organizations/organization.entity';

// A flag key is only unique within an organization, not globally.
@Entity({ name: 'feature_flags' })
@Index(['organizationId', 'key'], { unique: true })
export class FeatureFlag {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  organizationId!: string;

  // ON DELETE CASCADE: removing the organization removes its flags.
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @Column()
  key!: string;

  @Column({ default: '' })
  description!: string;

  @Column({ default: false })
  enabled!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = randomUUID();
  }
}
