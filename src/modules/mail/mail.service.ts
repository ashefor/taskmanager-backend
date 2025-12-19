import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { formatDateForEmail } from 'src/common/utils/date.util';


@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    constructor(private readonly mailerService: MailerService) { }

    async sendEmail(options: ISendMailOptions) {
        const sendParams = {
            from: process.env.MAIL_FROM,
            to: options.to,
            subject: options.subject,
            template: options.template,
            context: options.context
        }
        const response = await this.mailerService.sendMail(sendParams);
        // this.logger.log(
        //     `Email sent successfully to recipients with the following parameters : ${JSON.stringify(
        //         sendParams,
        //         null,
        //         2
        //     )}`,
        //     response,
        // );
        return response
    }


    async sendWelcomeEmail(user: User, token: string) {
        const next_step_link = `http://localhost:3000/users/verify-account/${token}`;
        const options: ISendMailOptions = {
            to: user.email,
            subject: 'Welcome to Task Manager',
            template: 'welcome',
            context: {
                name: user.firstName,
                next_step_link
            }
        }
        await this.sendEmail(options);
    }


    async sendTaskAssignmentEmail(user: User, task: Task) {
        const taskUrl = `http://localhost:3000/tasks/${task.uuid}`;
        const formattedDate = formatDateForEmail(task.dueDate);
        const newTask = { ...task, taskUrl, formattedDate };
        const options: ISendMailOptions = {
            to: user.email,
            subject: 'You have a new task',
            template: 'task-assignment',
            context: {
                name: user.firstName,
                task: newTask
            }
        }
        await this.sendEmail(options);
    }

    async sendTaskReminderEmail(user: User, task: Task) {
        const taskUrl = `http://localhost:3000/tasks/${task.uuid}`;
        const newTask = { ...task, taskUrl };
        const options: ISendMailOptions = {
            to: user.email,
            subject: 'Task Reminder',
            template: 'task-reminder',
            context: {
                name: user.firstName,
                task: newTask
            }
        }
        await this.sendEmail(options);
    }


    async resendVerification(user: User, token: string) {
        const next_step_link = `http://localhost:3000/auth/verify-account/${token}/${user.email}`;
        const options: ISendMailOptions = {
            to: user.email,
            subject: 'Verify Your Account',
            template: 'verify-account',
            from: 'Task Manager',
            context: {
                name: user.firstName,
                next_step_link
            }
        }
        await this.sendEmail(options);
    }
    
}
