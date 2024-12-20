import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({
    type: LoginDto,
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.loginViaRest(loginDto);
  }

  @Post('logout')
  @ApiBody({
    type: LogoutDto,
  })
  async logout(@Body(ValidationPipe) logoutDto: LogoutDto) {
    await this.authService.revokeRefreshToken(logoutDto.email);
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refresh(
    @Body('email') email: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    const isValid = await this.authService.validateRefreshToken(
      email,
      refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = await this.authService.generateAccessToken(email);
    return { accessToken: newAccessToken };
  }
}
