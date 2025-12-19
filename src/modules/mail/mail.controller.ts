import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { type ISendMailOptions } from '@nestjs-modules/mailer';

@Controller('mail')
export class MailController {
    constructor(private mailService: MailService) { }

    @Get()
    async sendMail(options: ISendMailOptions) {
        await this.mailService.sendEmail(options);
    }
}
