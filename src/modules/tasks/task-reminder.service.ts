import { Injectable, Logger } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { MailService } from '../mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskReminderService {
    private readonly logger = new Logger(TaskReminderService.name);

    constructor(
        private readonly taskService: TasksService,
        private readonly mailService: MailService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async sendReminders() {
        const now = new Date();
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

        const almostDueTasks = await this.taskService.findTasksDueBefore(fifteenMinutesFromNow);
        for (const task of almostDueTasks) {
            if (!task.reminderSent) {
                const user = task.assignee ? task.assignee : task.createdBy;
                try {
                    await this.mailService.sendTaskReminderEmail(user, task);
                    await this.taskService.markReminderSent(task.uuid);
                    // this.logger.log(`Reminder sent for task: ${task.title}`);
                } catch (error) {
                    this.logger.error(`Failed to send reminder for ${task.title}`, error);
                }
            }
        }
    }
}
