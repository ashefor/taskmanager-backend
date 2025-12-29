import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ResponseHelper } from 'src/common/helpers/response-helper';
import { Public } from 'src/common/constants/public';
import { PaginationQueryDto } from 'src/common/helpers/dto/pagination-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/common/helpers/current-user.decorator';
import { User } from './user.entity';


@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Public()
    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        type: User,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 409, description: 'User with email already exists' })
    async createUser(@Body() user: CreateUserDto): Promise<any> {
        const response = await this.userService.createUser(user);
        return ResponseHelper.success(response, 'SUCCESS', 'User created successfully');
    }

    @ApiBearerAuth()
    @Get()
    @ApiOperation({ summary: 'Get all users with pagination' })
    @ApiResponse({
        status: 200,
        description: 'Users fetched successfully',
        type: [User],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getAllUsers(@Query() query: PaginationQueryDto): Promise<any> {
        return this.userService.getAllUsers(query);
    }

    @ApiBearerAuth()
    @Put(':user_id')
    @ApiOperation({ summary: 'Update user information' })
    @ApiParam({
        name: 'user_id',
        description: 'UUID of the user to update',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: User,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateUser(@Param('user_id') user_id: string, @Body() userdto: UpdateUserDto, @CurrentUser() user: User) {
        const response = await this.userService.updateUser(user_id, userdto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'User updated successfully');
    }
}
