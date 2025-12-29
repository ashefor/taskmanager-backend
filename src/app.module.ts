import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { DataSource } from 'typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { MailModule } from './modules/mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { TasksModule } from './modules/tasks/tasks.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CommentsModule } from './modules/comments/comments.module';
import { TokenModule } from './common/helpers/token/token.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60, // 1 minute window
      limit: 5, // max 5 requests per minute per IP
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'uploads'), // ✅ serve from "src/uploads"
      serveRoot: '/uploads', // URL prefix
    }),
    PassportModule.register({ session: true }),
    UsersModule,
    MailModule,
    AuthModule,
    TasksModule,
    AttachmentsModule,
    CommentsModule,
    TokenModule,
    ActivityLogModule,
    // StorageModule
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  }],
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
