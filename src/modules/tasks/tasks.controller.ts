import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateTaskDto } from './dto/create-task.dto';
import { CurrentUser } from 'src/common/helpers/current-user.decorator';
import { ResponseHelper } from 'src/common/helpers/response-helper';
import { multerStorage } from 'src/common/constants/multer-storage';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CommentTaskDto } from './dto/comment-task.dto';
import { User } from '../users/user.entity';
import { PaginationQueryDto } from 'src/common/helpers/dto/pagination-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {

    constructor(private tasksService: TasksService) { }

    @Post()
    // @UseInterceptors(FilesInterceptor('attachments', 5))
    @UseInterceptors(
        FilesInterceptor('attachments', 5, {
            storage: multerStorage
        }),
    )
    // @UsePipes(new SanitizeHtmlPipe())
    async createTask(@Body() createTaskDto: CreateTaskDto, @UploadedFiles() files: Array<Express.Multer.File>, @CurrentUser() user) {
        const response = await this.tasksService.createTask(createTaskDto, user, files);
        return ResponseHelper.success(response, 'SUCCESS', 'Task created successfully');
    }

    @Put(':task_id')
    async updateTask(@Param('task_id') task_id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() user) {        
        const response = await this.tasksService.updateTask(task_id, updateTaskDto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Task updated successfully');
    }

    @Get()
    async getAllTasks(@Query() dto: PaginationQueryDto) {
        const response = await this.tasksService.getAllTasks(dto);
        return ResponseHelper.success(response, 'SUCCESS', 'Tasks fetched successfully');
    }

    @Get(':task_id')
    async getTaskById(@Param('task_id') task_id: string, @CurrentUser() user: User) {
        const response = await this.tasksService.getTaskById(task_id, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Task fetched successfully');
    }

    @Delete(':task_id')
    async deleteTask(@Param('task_id') task_id: string, @CurrentUser() user: User) {
        const response = await this.tasksService.deleteTask(task_id, user.uuid);
        return ResponseHelper.success(response, 'SUCCESS', 'Task deleted successfully');
    }

    @Patch(':task_id')
    async updateTaskStatus(@Param('task_id') task_id: string, @Body() updateTaskDto: UpdateTaskStatusDto, @CurrentUser() user: User) {
        const response = await this.tasksService.updateTaskStatus(task_id, updateTaskDto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Task updated successfully');
    }

    @Get(':user_id')
    async getTasksByUser(@Param('user_id') user_id: string) {
        const response = await this.tasksService.getTasksByUser(user_id);
        return ResponseHelper.success(response, 'SUCCESS', 'Tasks fetched successfully');
    }

    @Get('mine')
    async getMyTasks(@CurrentUser() user: User) {
        const response = await this.tasksService.getTasksByUser(user.uuid);
        return ResponseHelper.success(response, 'SUCCESS', 'Tasks fetched successfully');
    }

    @Get(':task_id/comments')
    async getAllCommentsInTask(@Param('task_id') task_id: string, @Query() dto: PaginationQueryDto, @CurrentUser() user: User) {
        const response = await this.tasksService.getAllCommentsInTask(task_id, dto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Comments fetched successfully');
    }

    @Post(':task_id/comments')
    async addCommentToTask(@Param('task_id') task_id: string, @Body() commentTaskDto: CommentTaskDto, @CurrentUser() user: User) {
        const response = await this.tasksService.addCommentToTask(task_id, commentTaskDto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Comment added successfully');
    }

    @Delete(':task_id/comments/:comment_id')
    async deleteCommentFromtask(@Param('task_id') task_id: string, @Param('comment_id') comment_id: string, @CurrentUser() user: User) {
        const response = await this.tasksService.deleteCommentFromtask(task_id, comment_id, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Comment deleted successfully');
    }

    @Get(':task_id/attachments')
    async getAllAttachmentsInTask(@Param('task_id') task_id: string, @CurrentUser() user: User) {
        const response = await this.tasksService.getAllAttachmentsInTask(task_id, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Attachments fetched successfully');
    }

     @Post(':task_id/attachments')
      @UseInterceptors(
        FilesInterceptor('attachments', 5, {
            storage: multerStorage
        }),
    )
    async addAttachmentsToTask(@Param('task_id') task_id: string, @UploadedFiles() files: Array<Express.Multer.File>, @CurrentUser() user: User) {
        const response = await this.tasksService.addAttachmentsToTask(task_id, files, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Attachments fetched successfully');
    }

}
