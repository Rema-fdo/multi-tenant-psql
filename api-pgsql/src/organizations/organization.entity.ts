import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { randomUUID } from 'node:crypto';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Generate the id in the app so no Postgres uuid extension is needed.
  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = randomUUID();
  }
}
