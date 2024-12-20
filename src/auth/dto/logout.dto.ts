import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'abc@gmail.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
