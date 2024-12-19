import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiBody({
    type: LoginDto,
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.loginViaRest(loginDto);
  }
}
