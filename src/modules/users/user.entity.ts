
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User extends BaseEntity {

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @Column()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @Column()
  lastName: string;

  @ApiProperty({
    description: 'Whether the user account is verified',
    example: false,
    default: false,
  })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @Column()
  @IsOptional()
  fullName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'User password (hashed)',
    example: '$2a$10$...',
  })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({
    description: 'Token version for JWT invalidation',
    example: 0,
    default: 0,
  })
  @Column({default: 0})
  tokenVersion: number;

  @ApiPropertyOptional({
    description: 'Password reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Column({ nullable: true })
  passwordResetToken?: string;

  @ApiPropertyOptional({
    description: 'Password reset token expiration timestamp',
    example: '2024-12-31T23:59:59.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @ApiProperty({
    description: 'Tasks created by this user',
    type: () => [Task],
  })
  @OneToMany(() => Task, t => t.createdBy)
  createdTasks: Task[];

  @ApiProperty({
    description: 'Tasks assigned to this user',
    type: () => [Task],
  })
  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];
}
