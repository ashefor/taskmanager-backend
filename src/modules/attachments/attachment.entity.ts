import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Task } from "../tasks/task.entity";
import { Exclude, Expose } from "class-transformer";
import { User } from "../users/user.entity";

@Entity()
export class Attachment extends BaseEntity {
    @Column()
    originalname: string;

    @Column()
    filename: string;


    @Column()
    @Exclude()
    filepath: string;

    @Column()
    mimetype: string;

    @ManyToOne(() => Task, (task) => task.attachments, { onDelete: 'CASCADE' })
    @Exclude()
    task: Task;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'created_by' })
    createdBy: User

    @Expose()
    get url(): string {
    const base = process.env.BASE_URL || 'http://localhost:3000';
    return `${base}/uploads/attachments/${this.filename}`;
  }
}