import { IsString, IsOptional, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import type { taskPriority, taskStatus } from 'src/common/constants/models';
export class CreateTaskDto {
    @IsNotEmpty({ message: 'Enter the task title' })
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
    status?: taskStatus;

    @IsOptional()
    @IsString()
    @IsEnum(['low', 'medium', 'high', 'critical'])
    priority?: taskPriority;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsDateString()
    estimatedAt?: Date;

    @IsOptional()
    assigneeId?: string;
}
