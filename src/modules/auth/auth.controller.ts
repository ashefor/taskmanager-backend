import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ResponseHelper } from 'src/common/helpers/response-helper';
import { UserSignInDTO } from './dto/login.dto';
import { Public } from 'src/common/constants/public';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { CurrentUser } from 'src/common/helpers/current-user.decorator';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private userService: UsersService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: UserSignInDTO })
    @ApiResponse({
        status: 200,
        description: 'Successfully logged in',
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() user: UserSignInDTO): Promise<any> {
        const response = await this.authService.login(user);
        return ResponseHelper.success(response, 'LOGGED_IN');
    }

    @Public()
    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'john.doe@example.com',
                    description: 'Email address to send reset link',
                },
            },
            required: ['email'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Forgot password email sent successfully',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async forgotPassword(@Body() params: {email: string}) { 
        await this.authService.sendForgotPasswordEmail(params.email);
        return ResponseHelper.success(null, 'SUCCESS', 'Forgot password email sent successfully');
    }

    @Public()
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'Password reset token',
                },
                password: {
                    type: 'string',
                    example: 'NewSecurePassword123!',
                    description: 'New password',
                },
            },
            required: ['token', 'password'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Password reset successfully',
    })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async resetPassword(@Body() params: {token: string, password: string}) {
        await this.authService.resetPassword(params.token, params.password);
        return ResponseHelper.success(null, 'PASSWORD_RESET');
    }


    // @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('profile')
    @ApiOperation({ summary: 'Get authenticated user profile' })
    @ApiResponse({
        status: 200,
        description: 'Profile fetched successfully',
        type: User,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getProfile(@Request() request) {
        return ResponseHelper.success(request.user, 'SUCCESS', 'Profile fetched successfully');
    }


    @Public()
    @Post('verify-account')
    @ApiOperation({ summary: 'Verify user account' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'Account verification token',
                },
                email: {
                    type: 'string',
                    example: 'john.doe@example.com',
                    description: 'User email address',
                },
            },
            required: ['token', 'email'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'User account verified successfully',
    })
    @ApiResponse({ status: 400, description: 'Invalid token or email' })
    async verifyUser(@Body() Param: { token: string, email: string }): Promise<any> {
        const response = await this.userService.verifyUserAccount(Param);
        return ResponseHelper.success(response, 'USER_VERIFIED');
    }

    @Public()
    @UseGuards(ThrottlerGuard)
    @Get('resend-verification/:email')
    @ApiOperation({ summary: 'Resend verification email' })
    @ApiParam({
        name: 'email',
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    @ApiResponse({
        status: 200,
        description: 'Verification email sent successfully',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
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

    @ApiBearerAuth()
    @UseGuards(ThrottlerGuard)
    @Post('change-password')
    @ApiOperation({ summary: 'Change user password' })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
    })
    @ApiResponse({ status: 400, description: 'Invalid current password' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
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
