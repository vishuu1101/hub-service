import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDTO {
  @ApiProperty({ example: 'abc@gmail.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
