import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LogoutRequestDTO {
  @ApiProperty({ example: 'abc@gmail.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
