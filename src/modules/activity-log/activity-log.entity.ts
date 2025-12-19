// src/tasks/entities/task-activity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum ActivityType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  COMMENTED = 'COMMENTED',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED',
  ATTACHMENT_ADDED = 'ATTACHMENT_ADDED',
  DELETED = 'DELETED',
  VIEWED = 'VIEWED',
  REMINDER_SENT = 'REMINDER_SENT',
  UPLOADED = 'UPLOADED',
}

export enum ActivityScope {
  TASK = 'TASK',
  COMMENT = 'COMMENT',
  USER = 'USER',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: ActivityType })
  action: ActivityType;

  @Column({ type: 'enum', enum: ActivityScope })
  scope: ActivityScope; // e.g. "Task", "Comment", "User"

  @Column()
  scope_identifier: string; // uuid of the entity that was affected

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ type: 'json', nullable: true })
  changes?: Record<string, { before: any; after: any }>; // ✅ field diffs

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
