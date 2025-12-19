import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Exclude } from 'class-transformer';

@Entity('comments')
export class TaskComment extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: 'CASCADE' })
  @Exclude()
  task: Task;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @DeleteDateColumn()
  deletedAt?: Date; 
}
