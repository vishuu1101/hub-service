import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  id: number;
  @ApiProperty({example: "abnc"})
  @IsString()
  firstName: string;
  @ApiProperty({example: "abnc"})
  @IsString()
  lastName: string;
  @ApiProperty({example: "abnc@gmail.com"})
  @IsString()
  @IsEmail()
  email: string;
}
