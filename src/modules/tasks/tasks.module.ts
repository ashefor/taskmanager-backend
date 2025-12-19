import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
import { Attachment } from '../attachments/attachment.entity';
import { MailModule } from '../mail/mail.module';
import { TaskComment } from '../comments/comment.entity';
import { TaskReminderService } from './task-reminder.service';
import { Activity } from '../activity-log/activity-log.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Activity, Attachment, TaskComment]), MailModule, ActivityLogModule],
  controllers: [TasksController],
  providers: [TasksService, TaskReminderService],
  exports: [TasksService, TaskReminderService],
})
export class TasksModule {}
