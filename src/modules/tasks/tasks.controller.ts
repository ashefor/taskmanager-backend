import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiConsumes } from '@nestjs/swagger';
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
import { Task } from './task.entity';
import { TaskComment } from '../comments/comment.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {

    constructor(private tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Implement user authentication' },
                description: { type: 'string', example: 'Create login and registration endpoints' },
                status: { type: 'string', enum: ['pending', 'in-progress', 'completed', 'cancelled'] },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                dueDate: { type: 'string', format: 'date-time' },
                estimatedAt: { type: 'string', format: 'date-time' },
                assigneeId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                attachments: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Task created successfully',
        type: Task,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
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
    @ApiOperation({ summary: 'Update a task' })
    @ApiParam({
        name: 'task_id',
        description: 'UUID of the task to update',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiBody({ type: UpdateTaskDto })
    @ApiResponse({
        status: 200,
        description: 'Task updated successfully',
        type: Task,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async updateTask(@Param('task_id') task_id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() user) {        
        const response = await this.tasksService.updateTask(task_id, updateTaskDto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Task updated successfully');
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks with pagination and filters' })
    @ApiResponse({
        status: 200,
        description: 'Tasks fetched successfully',
        type: [Task],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getAllTasks(@Query() dto: PaginationQueryDto) {
        const response = await this.tasksService.getAllTasks(dto);
        return ResponseHelper.success(response, 'SUCCESS', 'Tasks fetched successfully');
    }

    @Get(':task_id')
    @ApiOperation({ summary: 'Get task by ID' })
    @ApiParam({
        name: 'task_id',
        description: 'UUID of the task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'Task fetched successfully',
        type: Task,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getTaskById(@Param('task_id') task_id: string, @CurrentUser() user: User) {
        const response = await this.tasksService.getTaskById(task_id, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Task fetched successfully');
    }

    @Delete(':task_id')
    @ApiOperation({ summary: 'Delete a task' })
    @ApiParam({
        name: 'task_id',
        description: 'UUID of the task to delete',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'Task deleted successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async deleteTask(@Param('task_id') task_id: string, @CurrentUser() user: User) {
        const response = await this.tasksService.deleteTask(task_id, user.uuid);
        return ResponseHelper.success(response, 'SUCCESS', 'Task deleted successfully');
    }

    @Patch(':task_id')
    @ApiOperation({ summary: 'Update task status' })
    @ApiParam({
        name: 'task_id',
        description: 'UUID of the task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiBody({ type: UpdateTaskStatusDto })
    @ApiResponse({
        status: 200,
        description: 'Task status updated successfully',
        type: Task,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async updateTaskStatus(@Param('task_id') task_id: string, @Body() updateTaskDto: UpdateTaskStatusDto, @CurrentUser() user: User) {
        const response = await this.tasksService.updateTaskStatus(task_id, updateTaskDto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Task updated successfully');
    }

    @Get(':user_id')
    @ApiOperation({ summary: 'Get tasks by user ID' })
    @ApiParam({
        name: 'user_id',
        description: 'UUID of the user',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'Tasks fetched successfully',
        type: [Task],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getTasksByUser(@Param('user_id') user_id: string) {
        const response = await this.tasksService.getTasksByUser(user_id);
        return ResponseHelper.success(response, 'SUCCESS', 'Tasks fetched successfully');
    }

    @Get('mine')
    @ApiOperation({ summary: 'Get current user tasks' })
    @ApiResponse({
        status: 200,
        description: 'Tasks fetched successfully',
        type: [Task],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMyTasks(@CurrentUser() user: User) {
        const response = await this.tasksService.getTasksByUser(user.uuid);
        return ResponseHelper.success(response, 'SUCCESS', 'Tasks fetched successfully');
    }

    @Get(':task_id/comments')
    @ApiOperation({ summary: 'Get all comments for a task' })
    @ApiParam({
        name: 'task_id',
        description: 'UUID of the task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'Comments fetched successfully',
        type: [TaskComment],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getAllCommentsInTask(@Param('task_id') task_id: string, @Query() dto: PaginationQueryDto, @CurrentUser() user: User) {
        const response = await this.tasksService.getAllCommentsInTask(task_id, dto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Comments fetched successfully');
    }

    @Post(':task_id/comments')
    @ApiOperation({ summary: 'Add a comment to a task' })
    @ApiParam({
        name: 'task_id',
        description: 'UUID of the task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiBody({ type: CommentTaskDto })
    @ApiResponse({
        status: 201,
        description: 'Comment added successfully',
        type: TaskComment,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async addCommentToTask(@Param('task_id') task_id: string, @Body() commentTaskDto: CommentTaskDto, @CurrentUser() user: User) {
        const response = await this.tasksService.addCommentToTask(task_id, commentTaskDto, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Comment added successfully');
    }

    @Delete(':task_id/comments/:comment_id')
    @ApiOperation({ summary: 'Delete a comment from a task' })
    @ApiParam({
        name: 'task_id',
        description: 'UUID of the task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiParam({
        name: 'comment_id',
        description: 'UUID of the comment',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    @ApiResponse({
        status: 200,
        description: 'Comment deleted successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Comment or task not found' })
    async deleteCommentFromtask(@Param('task_id') task_id: string, @Param('comment_id') comment_id: string, @CurrentUser() user: User) {
        const response = await this.tasksService.deleteCommentFromtask(task_id, comment_id, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Comment deleted successfully');
    }

    @Get(':task_id/attachments')
    @ApiOperation({ summary: 'Get all attachments for a task' })
    @ApiParam({
        name: 'task_id',
        description: 'UUID of the task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'Attachments fetched successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getAllAttachmentsInTask(@Param('task_id') task_id: string, @CurrentUser() user: User) {
        const response = await this.tasksService.getAllAttachmentsInTask(task_id, user);
        return ResponseHelper.success(response, 'SUCCESS', 'Attachments fetched successfully');
    }

     @Post(':task_id/attachments')
     @ApiOperation({ summary: 'Add attachments to a task' })
     @ApiConsumes('multipart/form-data')
     @ApiParam({
         name: 'task_id',
         description: 'UUID of the task',
         example: '550e8400-e29b-41d4-a716-446655440000',
     })
     @ApiBody({
         schema: {
             type: 'object',
             properties: {
                 attachments: {
                     type: 'array',
                     items: { type: 'string', format: 'binary' },
                     description: 'Files to attach (max 5)',
                 },
             },
         },
     })
     @ApiResponse({
         status: 201,
         description: 'Attachments added successfully',
     })
     @ApiResponse({ status: 400, description: 'Invalid input' })
     @ApiResponse({ status: 401, description: 'Unauthorized' })
     @ApiResponse({ status: 404, description: 'Task not found' })
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
