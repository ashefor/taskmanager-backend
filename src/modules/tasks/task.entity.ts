import { BaseEntity } from "src/common/entities/base.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../users/user.entity";
import { Attachment } from "../attachments/attachment.entity";
import { TaskComment } from "../comments/comment.entity";

@Entity()
export class Task extends BaseEntity {
    @Column() title: string;
    @Column({ type: 'text', nullable: true }) description?: string;

    @Column({ default: 'pending' })
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';

    @Column({ nullable: true, default: 'low' })
    priority?: 'low' | 'medium' | 'high' | 'critical';

    @Column({ type: 'timestamp', nullable: true })
    dueDate?: Date;

    // @Column({ type: 'timestamp', nullable: true }) estimatedAt?: Date;
    @ManyToOne(() => User, u => u.createdTasks, { eager: false, onDelete: 'CASCADE' }) createdBy: User;

    @OneToMany(() => Attachment, a => a.task) attachments: Attachment[];

    // @ManyToOne(() => User, u => u.assignedTasks, { eager: false }) assignedTo: User[];

    @OneToMany(() => TaskComment, (comment) => comment.task, { cascade: true })
    comments: TaskComment[];

    @ManyToOne(() => User, (user) => user.assignedTasks, { eager: false, nullable: true })
    @JoinColumn({ name: 'assignee_id' })
    assignee?: User;

    @Column({ type: 'boolean', default: false })
    reminderSent: boolean;

    @DeleteDateColumn()
    deletedAt?: Date;

    // @OneToMany(() => Activity, (activity) => activity.scope)
    // activities: Activity[];

}