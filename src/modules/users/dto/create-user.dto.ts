import { IsEmail, IsString, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsString({ message: 'First name must be a string' }) 
  firstName: string;

  @IsString({ message: 'Last name must be a string' }) 
  lastName: string;

  @IsEmail() 
  email: string;

  @IsString() 
  @MinLength(6) 
  password: string;
}
