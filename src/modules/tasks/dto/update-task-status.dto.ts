import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import type { taskStatus } from 'src/common/constants/models';

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'New status for the task',
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    example: 'in-progress',
    required: true,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
  status: taskStatus
}
