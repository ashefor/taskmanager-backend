import { IsEnum, IsNotEmpty } from 'class-validator';
import type { taskStatus } from 'src/common/constants/models';

export class UpdateTaskStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
  status: taskStatus
}
