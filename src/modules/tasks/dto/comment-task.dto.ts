import { IsNotEmpty } from 'class-validator';

export class CommentTaskDto {
  @IsNotEmpty({ message: 'Comment is required' })
  content: string;
}
