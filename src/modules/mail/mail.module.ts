import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';


@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '2525', 10),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD
        }
      },
      defaults: {
        from: process.env.MAIL_FROM
      },
      template: {
        dir: path.join(__dirname, '../../templates', 'emails'),
        adapter: new HandlebarsAdapter(undefined, {
          inlineCssEnabled: true,
        }),
        options: {
          strict: true
        }
      },
      options: {
        partials: {
          dir: path.join(__dirname, '../../templates', 'partials'),
          options: {
            strict: true,
          },
        },
      },
      })
    })
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService]
})
export class MailModule { }
