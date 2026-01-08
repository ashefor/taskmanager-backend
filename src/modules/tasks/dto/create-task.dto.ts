import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { TaskPriority, TaskStatus } from 'src/common/constants/models';
// import type { taskPriority, taskStatus } from 'src/common/constants/models';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Title of the task',
        example: 'Implement user authentication',
        required: true,
    })
    @IsNotEmpty({ message: 'Enter the task title' })
    @IsString()
    title: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the task',
        example: 'Create login and registration endpoints with JWT authentication',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Current status of the task',
        enum: TaskStatus,
        example: TaskStatus.BACKLOG,
    })
    @IsOptional()
    @IsString()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiPropertyOptional({
        description: 'Priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.HIGH,
    })
    @IsOptional()
    @IsString()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiPropertyOptional({
        description: 'Due date for the task',
        example: '2024-12-31T23:59:59.000Z',
    })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiPropertyOptional({
        description: 'Estimated completion date',
        example: '2024-12-25T10:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    estimatedAt?: Date;

    @ApiPropertyOptional({
        description: 'UUID of the user to assign the task to',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsOptional()
    assigneeId?: string;
}