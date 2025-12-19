import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MailModule } from '../mail/mail.module';
import { Task } from '../tasks/task.entity';
import { TokenModule } from 'src/common/helpers/token/token.module';

@Module({
    imports: [TypeOrmModule.forFeature([User, Task]), MailModule, TokenModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
