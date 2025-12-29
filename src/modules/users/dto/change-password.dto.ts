import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'CurrentPassword123!',
    minLength: 6,
    required: true,
  })
  @IsString() 
  @MinLength(6) 
  currentPassword: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'NewSecurePassword123!',
    minLength: 6,
    required: true,
  })
  @IsString() 
  @MinLength(6) 
  newPassword: string
}
