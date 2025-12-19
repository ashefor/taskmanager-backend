import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import bcrypt from 'node_modules/bcryptjs';
import { MailService } from '../mail/mail.service';
import { randomUUID } from 'crypto';
import { Task } from '../tasks/task.entity';
import { PaginateRepositoryHelper } from 'src/common/helpers/paginate.helper';
import { PaginationQueryDto } from 'src/common/helpers/dto/pagination-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseHelper } from 'src/common/helpers/response-helper';
import { TokenService } from 'src/common/helpers/token/token.service';
import { ChangePasswordDto } from './dto/change-password.dto';


@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(@InjectRepository(User) private usersRepository: Repository<User>, private mailService: MailService, @InjectRepository(Task) private taskRepository: Repository<Task>, private readonly tokenService: TokenService) { }

    async createUser(dto: CreateUserDto): Promise<any> {
        const exists = await this.usersRepository.exists({ where: { email: dto.email } });
        if (exists) {
            throw new BadRequestException(ResponseHelper.fail('DUPLICATE_EMAIL'));
        }
        const user = this.usersRepository.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: await bcrypt.hash(dto.password, 10),
            fullName: `${dto.firstName} ${dto.lastName}`,
            uuid: randomUUID(),
        });
        const response = await this.usersRepository.save(user);
        const token = this.tokenService.generateAccessToken({ sub: response.uuid, email: user.email });
        const access_token = this.tokenService.generateAccessToken({ sub: response.uuid, email: user.email });

        (async () => {
            try {
                await this.mailService.sendWelcomeEmail(user, token);
            } catch (error) {
                console.log(error)
                this.logger.error(error);
            }
        })()
        const expiresIn = 60 * 60 * 24;
        const responseWithoutPassword = { ...response, password: undefined };
        return { ...responseWithoutPassword, access_token, expires_in: expiresIn };
    }

    async getAllUsers(query: PaginationQueryDto): Promise<any> {
        const results = await PaginateRepositoryHelper({
            repository: this.usersRepository,
            alias: 'user',
            pagination: query,
            searchFields: ['firstName', 'lastName', 'email'],
        })
        return results;
    }

    async updateUser(user_id: string, dto: UpdateUserDto, user: User): Promise<any> {
        const foundUser = await this.usersRepository.findOne({ where: { uuid: user_id } });
        if (!foundUser) {
            throw new BadRequestException(ResponseHelper.fail('USER_NOT_FOUND'));
        }
        if (foundUser.email !== user.email && foundUser.uuid !== user.uuid) {
            throw new ForbiddenException(ResponseHelper.fail('FORBIDDEN'));
        }
        const response = await this.usersRepository.update({ uuid: user_id }, { ...dto });
        if (response.affected === 0) {
            throw new ForbiddenException(ResponseHelper.fail('FORBIDDEN', 'You are not allowed to update this user'));
        }
    }

    async getAllTasksCreatedByUser(user_id: string): Promise<any> {
        const exists = await this.usersRepository.exists({ where: { uuid: user_id } });
        if (!exists) {
            throw new BadRequestException(ResponseHelper.fail('USER_NOT_FOUND'));
        }
        const tasks = await this.taskRepository.find({ where: { createdBy: { uuid: user_id } }, relations: ['attachments'] });
        return tasks;
    }

    async verifyUserAccount(params: { token: string, email: string }): Promise<User> {
        const { token, email } = params;
        if (!token || !email) {
            throw new BadRequestException(ResponseHelper.fail('BAD_REQUEST', 'Token and email are required'));
        }

        const payload = this.tokenService.verifyToken(token);
        const exp = payload.exp || 0;
        const hasExpired = new Date(exp * 1000) < new Date();

        if (hasExpired) {
            throw new BadRequestException(ResponseHelper.fail('TOKEN_EXPIRED'));
        }

        const user = await this.usersRepository.findOneBy({ uuid: payload.sub });
        if (!user) {
            throw new BadRequestException(ResponseHelper.fail('USER_NOT_FOUND'));
        }
        if (user.email !== email) {
            throw new BadRequestException(ResponseHelper.fail('USER_NOT_FOUND'));
        }
        if (user.isVerified) {
            throw new BadRequestException(ResponseHelper.fail('USER_ALREADY_VERIFIED'));
        }
        user.isVerified = true;
        return this.usersRepository.save(user);
    }

    async resendVerification(email: string) {
        const user = await this.usersRepository.findOneBy({ email });

        if (!user) {
            throw new BadRequestException(ResponseHelper.fail('USER_NOT_FOUND'));
        };
        if (user.isVerified) {
            throw new BadRequestException(ResponseHelper.fail('USER_ALREADY_VERIFIED'));
        }
        const token = this.tokenService.generateAccessToken({ sub: user.uuid, email: user.email });
        await this.mailService.resendVerification(user, token);

        return user
    }

    async changePassword(changePasswordDto: ChangePasswordDto, user_id: string): Promise<any> {
        const user = await this.usersRepository.findOneBy({ uuid: user_id });
        if (!user) {
            throw new BadRequestException(ResponseHelper.fail('USER_NOT_FOUND'));
        }
        const { currentPassword, newPassword } = changePasswordDto;
        const tokenVersion = user.tokenVersion
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            throw new BadRequestException(ResponseHelper.fail('WRONG_PASSWORD'));
        }
        if (newPassword === currentPassword) {
            throw new BadRequestException(ResponseHelper.fail('SAME_PASSWORD'));
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await this.usersRepository.update({ uuid: user.uuid }, {tokenVersion: tokenVersion + 1, password: hashedPassword });

        if (result.affected === 0) {
            throw new ForbiddenException(ResponseHelper.fail('FORBIDDEN', 'You are not allowed to update this user'));
        }
    }

    async findOne(params: { [key: string]: any }): Promise<User | null> {
        return this.usersRepository.findOne(params);
    }

    async findOneBy(params: { [key: string]: any }): Promise<User | null> {
        return this.usersRepository.findOneBy(params);
    }

    async remove(uuid: string): Promise<void> {
        await this.usersRepository.softDelete({ uuid });
    }
}
