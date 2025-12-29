import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Exclude } from 'class-transformer';

@Entity('comments')
export class TaskComment extends BaseEntity {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This task needs to be completed by end of week',
  })
  @Column()
  content: string;

  @ApiProperty({
    description: 'Task this comment belongs to',
    type: () => Task,
  })
  @ManyToOne(() => Task, (task) => task.comments, { onDelete: 'CASCADE' })
  @Exclude()
  task: Task;

  @ApiProperty({
    description: 'User who created the comment',
    type: () => User,
  })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ApiPropertyOptional({
    description: 'Soft delete timestamp',
    example: '2024-12-31T23:59:59.000Z',
  })
  @DeleteDateColumn()
  deletedAt?: Date; 
}
