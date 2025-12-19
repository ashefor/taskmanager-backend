import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ResponseHelper } from 'src/common/helpers/response-helper';
import { Public } from 'src/common/constants/public';
import { PaginationQueryDto } from 'src/common/helpers/dto/pagination-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/common/helpers/current-user.decorator';
import { User } from './user.entity';


@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Public()
    @Post()
    async createUser(@Body() user: CreateUserDto): Promise<any> {
        const response = await this.userService.createUser(user);
        return ResponseHelper.success(response, 'SUCCESS', 'User created successfully');
    }

    @Get()
    async getAllUsers(@Query() query: PaginationQueryDto): Promise<any> {
        return this.userService.getAllUsers(query);
    }

    @Put(':user_id')
    async updateUser(@Param('user_id') user_id: string, @Body() userdto: UpdateUserDto, @CurrentUser() user: User) {
        const response = await this.userService.updateUser(user_id, userdto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'User updated successfully');
    }
}
