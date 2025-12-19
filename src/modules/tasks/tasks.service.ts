import { BadGatewayException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Attachment } from '../attachments/attachment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { instanceToPlain } from 'class-transformer';
import { MailService } from '../mail/mail.service';
import { ResponseHelper } from 'src/common/helpers/response-helper';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskComment } from '../comments/comment.entity';
import { CommentTaskDto } from './dto/comment-task.dto';
import { PaginateRepositoryHelper } from 'src/common/helpers/paginate.helper';
import { PaginationQueryDto } from 'src/common/helpers/dto/pagination-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { sanitizeResponse } from 'src/common/utils/sanitize-response.util';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityScope, ActivityType } from '../activity-log/activity-log.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task) private taskRepository: Repository<Task>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(TaskComment) private taskCommentRepository: Repository<TaskComment>,
        @InjectRepository(Attachment) private attachmentRepository: Repository<Attachment>,
        private mailService: MailService,
        private activityLogService: ActivityLogService
    ) { }

    async createTask(dto: CreateTaskDto, user: User, files: Express.Multer.File[]): Promise<any> {
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const { assigneeId, ...taskData } = dto;

        const assignee = await this.userRepository.findOneBy({ uuid: assigneeId });
        const now = new Date();
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
        const isDueDateLessThan15Minutes = dto.dueDate && new Date(dto.dueDate) < fifteenMinutesFromNow;

        if (isDueDateLessThan15Minutes) {
            throw new BadGatewayException(ResponseHelper.fail('TASK_DATE_LESS_THAN_15_MIN_NOW'));
        }

        const task = this.taskRepository.create({
            ...taskData,
            createdBy: user,
            ...(assignee && { assignee })
        });
        const savedTask = await this.taskRepository.save(task);

        if (files && files.length > 0) {
            const attachments = files.map(file => {
                const attachment = this.attachmentRepository.create({
                    filepath: file.path || '',
                    mimetype: file.mimetype,
                    filename: file.filename,
                    originalname: file.originalname,
                    task: savedTask,
                });
                return attachment
            });
            await this.attachmentRepository.save(attachments);
            savedTask.attachments = attachments
        }

        (async () => {
            try {
                 await this.activityLogService.logActivity(ActivityScope.TASK,task.uuid,ActivityType.CREATED, user, `Task created by ${user.email}`);
                
                const userToSendTo = task.assignee ? task.assignee : user
                await this.mailService.sendTaskAssignmentEmail(userToSendTo, savedTask)
                
            } catch (error) {
                console.log({ 'email or logger error': error })
            }
        })();
        return instanceToPlain(task)
    }

    async updateTask(task_id: string, dto: UpdateTaskDto, user: User) {
        const task = await this.taskRepository.findOne({ where: { uuid: task_id }, relations: ['createdBy'] });
        const before = { ...task }
        
        if (!task) {
            throw new NotFoundException(ResponseHelper.fail('TASK_NOT_FOUND'));
        }
        if (task.createdBy.uuid !== user.uuid) {
            throw new ForbiddenException(ResponseHelper.fail('FORBIDDEN'));
        }
        Object.assign(task, dto);
        // const updatedTask = await this.taskRepository.update({ uuid: task_id }, { ...dto });
        const updatedTask = await this.taskRepository.save(task);

        (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, updatedTask.uuid, ActivityType.UPDATED, user, `Task Updated by ${user.email}`, before, updatedTask);
        })();
        return updatedTask
    }

    async getAllTasks(query: PaginationQueryDto) {
        // const tasks = await this.taskRepository.find({
        //     relations: ['attachments', 'comments', 'assignee', 'createdBy'],
        //     order: { createdAt: 'DESC' },
        // });

        const results = await PaginateRepositoryHelper({
            repository: this.taskRepository,
            pagination: query,
            relations: ['attachments', 'comments', 'assignee', 'createdBy'],
            searchFields: ['title', 'description'],
            alias: 'task',
            defaultSort: 'createdAt',
            // Map to include only attachment and comments count
            transform: (task) => ({
                ...task,
                attachmentCount: task.attachments?.length || 0,
                attachments: undefined,
                commentsCount: task.comments?.length || 0,
                comments: undefined
            })
        })
        
        return results
    }

    async getAllDeletedTasks(query: PaginationQueryDto) {
        const { page = 1, limit = 10 } = query
        const tasks = await this.taskRepository.find({
            withDeleted: true,
            where: { deletedAt: Not(IsNull()) },
            skip: (page - 1) * limit,
            take: query.limit
        });
        return tasks
    }

    async getTaskById(task_id: string, user: User) {
        const task = await this.taskRepository.findOne({
            where: { uuid: task_id },
            relations: ['assignee', 'createdBy'],
        });

        if (!task) throw new NotFoundException(ResponseHelper.fail('TASK_NOT_FOUND'));

         (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, task.uuid, ActivityType.VIEWED, user, `Task viewed`);
        })();

        return task
    }

    async deleteTask(task_id: string, user_id: string): Promise<void> {
        const result = await this.taskRepository.softDelete({
            uuid: task_id,
            createdBy: { uuid: user_id }
        });

        if (result.affected === 0) {
            throw new ForbiddenException(ResponseHelper.fail('FORBIDDEN', 'You are not allowed to delete this task'));
        }
    }

    async updateTaskStatus(task_id: string, dto: UpdateTaskStatusDto, user: User): Promise<any> {
        const task = await this.taskRepository.findOne({ where: { uuid: task_id } });
        if (!task) {
            throw new NotFoundException(ResponseHelper.fail('TASK_NOT_FOUND'));
        }
        const before = { status: dto.status }
        task.status = dto.status
        const updatedTask = await this.taskRepository.save(task);
        (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, updatedTask.uuid, ActivityType.UPDATED, user,`Task Status Updated by ${user.email}`, before, {status: updatedTask.status});
        })();
        return updatedTask
    }


    async getTasksByUser(user_id: string) {
        const tasks = this.taskRepository.find({ where: { createdBy: { uuid: user_id } }, relations: ['attachments'] });
        return tasks
    }

    async addCommentToTask(task_id: string, dto: CommentTaskDto, user: User): Promise<any> {
        const task = await this.taskRepository.findOne({ where: { uuid: task_id } });
        if (!task) {
            throw new NotFoundException(ResponseHelper.fail('TASK_NOT_FOUND'));
        }
        const taskComment = this.taskCommentRepository.create({ ...dto, task: task, createdBy: user });
        const response = await this.taskCommentRepository.save(taskComment);

        (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, task_id, ActivityType.COMMENTED, user,`Commented on Task by ${user.email}`);
        })();

        return sanitizeResponse(response, ['task']);
    }

    async getAllCommentsInTask(task_id: string, dto: PaginationQueryDto, user: User) {
        const { page = 1, limit = 10 } = dto
        const [items, total] = await this.taskCommentRepository.findAndCount({
            where: { task: { uuid: task_id } },
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, task_id, ActivityType.VIEWED, user,`Viewed Task Comments`);
        })();

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }
    }

    async deleteCommentFromtask(task_id: string, comment_id: string, user: User): Promise<void> {
        const comment = await this.taskCommentRepository.findOne({
            where: { uuid: comment_id, task: { uuid: task_id } },
            withDeleted: false,
        });

        console.log({ comment })

        if (!comment) {
            throw new NotFoundException(ResponseHelper.fail('COMMENT_NOT_FOUND'));
        }

        const result = await this.taskCommentRepository.softDelete({
            uuid: comment_id,
            createdBy: user, // ✅ direct DB column
        });

        (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, task_id, ActivityType.DELETED, user,`Deleted Comment on Task by ${user.email}`);
        })();

        if (result.affected === 0) {
            throw new ForbiddenException(ResponseHelper.fail('FORBIDDEN', 'You are not allowed to delete this comment'));
        }
    }

    async getAllAttachmentsInTask(task_id: string, user: User) {
        const attachments = this.attachmentRepository.find({ where: { task: { uuid: task_id } } });

        (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, task_id, ActivityType.VIEWED, user,`Viewed Task Attachments`);
        })();

        return attachments
    }

    async addAttachmentsToTask(task_id: string, files: Express.Multer.File[], user: User) {
        const task = await this.taskRepository.findOne({ where: { uuid: task_id } });
        if (!task) {
            throw new NotFoundException(ResponseHelper.fail('TASK_NOT_FOUND'));
        }
        const attachments = files.map(file => {
            const attachment = this.attachmentRepository.create({
                filepath: file.path || '',
                mimetype: file.mimetype,
                filename: file.filename,
                originalname: file.originalname,
                task: task,
            });
            return attachment
        });
        await this.attachmentRepository.save(attachments);

        (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, task_id, ActivityType.UPLOADED, user,`Uploaded Task Attachments by ${user.email}`);
        })();

        return attachments
    }

    async findTasksDueBefore(date: Date) {
        const tasks = this.taskRepository.find({ where: { dueDate: LessThanOrEqual(date), reminderSent: false }, relations: ['assignee', 'createdBy'] });
        return tasks
    }

    async markReminderSent(task_id: string,) {
        const task = await this.taskRepository.findOne({ where: { uuid: task_id } });
        if (!task) {
            throw new NotFoundException(ResponseHelper.fail('TASK_NOT_FOUND'));
        }

        (async () => {
            await this.activityLogService.logActivity(ActivityScope.TASK, task_id, ActivityType.REMINDER_SENT, null,`Task Reminder Sent`);
        })();

        return await this.taskRepository.update({ uuid: task_id }, { reminderSent: true });
    }

}
