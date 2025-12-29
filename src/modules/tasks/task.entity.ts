import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from "src/common/entities/base.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../users/user.entity";
import { Attachment } from "../attachments/attachment.entity";
import { TaskComment } from "../comments/comment.entity";

@Entity()
export class Task extends BaseEntity {
    @ApiProperty({
        description: 'Title of the task',
        example: 'Implement user authentication',
    })
    @Column() title: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the task',
        example: 'Create login and registration endpoints with JWT authentication',
    })
    @Column({ type: 'text', nullable: true }) description?: string;

    @ApiProperty({
        description: 'Current status of the task',
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        example: 'pending',
        default: 'pending',
    })
    @Column({ default: 'pending' })
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';

    @ApiPropertyOptional({
        description: 'Priority level of the task',
        enum: ['low', 'medium', 'high', 'critical'],
        example: 'high',
        default: 'low',
    })
    @Column({ nullable: true, default: 'low' })
    priority?: 'low' | 'medium' | 'high' | 'critical';

    @ApiPropertyOptional({
        description: 'Due date for the task',
        example: '2024-12-31T23:59:59.000Z',
    })
    @Column({ type: 'timestamp', nullable: true })
    dueDate?: Date;

    // @Column({ type: 'timestamp', nullable: true }) estimatedAt?: Date;

    @ApiProperty({
        description: 'User who created the task',
        type: () => User,
    })
    @ManyToOne(() => User, u => u.createdTasks, { eager: false, onDelete: 'CASCADE' }) createdBy: User;

    @ApiProperty({
        description: 'Attachments associated with the task',
        type: () => [Attachment],
    })
    @OneToMany(() => Attachment, a => a.task) attachments: Attachment[];

    // @ManyToOne(() => User, u => u.assignedTasks, { eager: false }) assignedTo: User[];

    @ApiProperty({
        description: 'Comments on the task',
        type: () => [TaskComment],
    })
    @OneToMany(() => TaskComment, (comment) => comment.task, { cascade: true })
    comments: TaskComment[];

    @ApiPropertyOptional({
        description: 'User assigned to the task',
        type: () => User,
    })
    @ManyToOne(() => User, (user) => user.assignedTasks, { eager: false, nullable: true })
    @JoinColumn({ name: 'assignee_id' })
    assignee?: User;

    @ApiProperty({
        description: 'Whether a reminder has been sent for this task',
        example: false,
        default: false,
    })
    @Column({ type: 'boolean', default: false })
    reminderSent: boolean;

    @ApiPropertyOptional({
        description: 'Soft delete timestamp',
        example: '2024-12-31T23:59:59.000Z',
    })
    @DeleteDateColumn()
    deletedAt?: Date;

    // @OneToMany(() => Activity, (activity) => activity.scope)
    // activities: Activity[];

}