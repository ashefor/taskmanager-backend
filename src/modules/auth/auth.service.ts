import { Injectable } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { MailService } from '../mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ResponseCodes } from 'src/common/constants/response-codes';
import * as bcrypt from 'bcryptjs';
import { UserSignInDTO } from './dto/login.dto';
import { TokenService } from 'src/common/helpers/token/token.service';
@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>, private mailService: MailService, private readonly tokenService: TokenService) { }

    async login(params: UserSignInDTO) {
        const user = await this.usersRepository.findOneBy({ email: params.email });
        if (!user) {
            throw new AppException(ResponseCodes.USER_NOT_FOUND);
        };
        const isMatch = await bcrypt.compare(params.password, user.password);
        if (!isMatch) {
            throw new AppException(ResponseCodes.INVALID_CREDENTIALS);
        };
        if (!user.isVerified) {
            const token = this.tokenService.generateAccessToken({ sub: user.uuid, email: user.email });
            this.mailService.resendVerification(user, token);
            throw new AppException(ResponseCodes.USER_NOT_VERIFIED);
        };

        const token = this.tokenService.generateAccessToken({ sub: user.uuid, email: user.email, version: user.tokenVersion });

        const expiresIn = 60 * 60 * 24;

        const userResponse = { fullName: user.fullName, email: user.email, uuid: user.uuid, isVerified: user.isVerified };
        return { ...userResponse, access_token: token, expires_in: expiresIn };
    }

    async sendForgotPasswordEmail(email: string) {
        const user = await this.usersRepository.findOneBy({ email });
        if (!user) {
            throw new AppException(ResponseCodes.USER_NOT_FOUND);
        };
        const resetToken = randomBytes(32).toString('hex');
        const hashedToken = createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await this.usersRepository.save(user);
        const password_reset_link = `http://localhost:3000/auth/reset-password/${hashedToken}`;
        await this.mailService.sendEmail({
            to: user.email,
            subject: 'Reset your password',
            template: 'forgot-password',
            context: {
                email: user.email,
                password_reset_link
            }
        })
        return;
    }

    async resetPassword(token: string, password: string) {
        // const hashedToken = createHash('sha256').update(token).digest('hex');
        // console.log({hashedToken})
        const user = await this.usersRepository.findOne({
            where: {
                passwordResetToken: token,
                passwordResetExpires: MoreThan(new Date()),
            },
        });
        if (!user) {
            throw new AppException(ResponseCodes.USER_NOT_FOUND);
        };
        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await this.usersRepository.save(user);
        return;
    }


    async resendVerification(user: User) {
        const token = this.tokenService.generateAccessToken({ sub: user.uuid, email: user.email });
        const next_step_link = `http://localhost:3000/auth/verify-account/${token}/${user.email}`;
        await this.mailService.sendEmail({
            to: user.email,
            subject: 'Verify Your Account',
            template: 'verify-account',
            from: 'Task Manager',
            context: {
                name: user.firstName,
                next_step_link
            }
        })
    }
    
}
