import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from 'src/common/constants/models';

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'New status for the task',
    enum: TaskStatus,
    example: TaskStatus.BACKLOG,
    required: true,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(TaskStatus)
  status: TaskStatus
}
