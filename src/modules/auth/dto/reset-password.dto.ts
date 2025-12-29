import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password for the account',
    example: 'NewSecurePassword123!',
    minLength: 8,
    required: true,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
