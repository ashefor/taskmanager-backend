import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CommentTaskDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This task needs to be completed by end of week',
    required: true,
  })
  @IsNotEmpty({ message: 'Comment is required' })
  content: string;
}
