import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseHelper } from 'src/common/helpers/response-helper';
import { UserSignInDTO } from './dto/login.dto';
import { Public } from 'src/common/constants/public';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { CurrentUser } from 'src/common/helpers/current-user.decorator';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private userService: UsersService) { }

    @Public()
    @Post('login')
    async login(@Body() user: UserSignInDTO): Promise<any> {
        const response = await this.authService.login(user);
        return ResponseHelper.success(response, 'LOGGED_IN');
    }

    @Public()
    @Post('forgot-password')
    async forgotPassword(@Body() params: {email: string}) { 
        await this.authService.sendForgotPasswordEmail(params.email);
        return ResponseHelper.success(null, 'SUCCESS', 'Forgot password email sent successfully');
    }

    @Public()
    @Post('reset-password')
    async resetPassword(@Body() params: {token: string, password: string}) {
        await this.authService.resetPassword(params.token, params.password);
        return ResponseHelper.success(null, 'PASSWORD_RESET');
    }


    // @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() request) {
        return ResponseHelper.success(request.user, 'SUCCESS', 'Profile fetched successfully');
    }


    @Public()
    @Post('verify-account')
    async verifyUser(@Body() Param: { token: string, email: string }): Promise<any> {
        const response = await this.userService.verifyUserAccount(Param);
        return ResponseHelper.success(response, 'USER_VERIFIED');
    }

    @Public()
    @UseGuards(ThrottlerGuard)
    @Get('resend-verification/:email')
    @Throttle({
        default: {
            limit: 3,
            ttl: 3600,
        }
    })
    async resendVerification(@Param() Param): Promise<any> {
        const response = await this.userService.resendVerification(Param.email);
        return ResponseHelper.success(response, 'SUCCESS', 'Verification email sent successfully');
    }

    @UseGuards(ThrottlerGuard)
    @Post('change-password')
    @Throttle({
        default: {
            limit: 1,
            ttl: 3600,
        }
    })
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @CurrentUser() user: User): Promise<any> {
        const response = await this.userService.changePassword(changePasswordDto, user.uuid);
        return ResponseHelper.success(response, 'SUCCESS', 'Password changed successfully');
    }
}
