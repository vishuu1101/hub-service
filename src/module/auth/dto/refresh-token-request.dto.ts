import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RefreshTokenRequestDTO {
  @ApiProperty({ example: 'abc@gmail.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'dfhdsjkgkfskk' })
  @IsString()
  refreshToken: string;
}
