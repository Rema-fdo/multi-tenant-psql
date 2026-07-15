import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Role } from '../common/enums/role.enum';
import { Organization } from '../organizations/organization.entity';

// Only org_admin and end_user are persisted. The super admin lives in config.
@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'varchar' })
  role!: Role;

  @Column('uuid')
  organizationId!: string;

  // ON DELETE CASCADE: removing the organization removes its users.
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = randomUUID();
  }
}
