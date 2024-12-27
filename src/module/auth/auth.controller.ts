import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDTO } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LogoutRequestDTO as LogoutRequestDTO } from './dto/logout-request.dto';
import { RefreshTokenRequestDTO } from './dto/refresh-token-request.dto';
import { ResponseUtil } from 'src/util/response.util';
import { ResponseDTO } from 'src/dto/response.dto';
import { LogoutResponseDTO } from './dto/logout-response.dto';
import { RefreshTokenResponseDTO } from './dto/refresh-token-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseUtil: ResponseUtil,
  ) {}

  @Post('login')
  @ApiBody({
    type: LoginRequestDTO,
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginRequestDTO,
  ): Promise<ResponseDTO<LoginResponseDto>> {
    const response = await this.authService.loginViaRest(loginDto);
    return this.responseUtil.successResponse(0, response);
  }

  @Post('logout')
  @ApiBody({
    type: LogoutRequestDTO,
  })
  async logout(
    @Body(ValidationPipe) logoutDto: LogoutRequestDTO,
  ): Promise<ResponseDTO<LogoutResponseDTO>> {
    const response = await this.authService.revokeRefreshToken(logoutDto.email);
    return this.responseUtil.successResponse(0, response);
  }

  @Post('refresh')
  @ApiBody({
    type: RefreshTokenRequestDTO,
  })
  async refresh(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenRequestDTO,
  ): Promise<ResponseDTO<RefreshTokenResponseDTO>> {
    const isValid = await this.authService.validateRefreshToken(
      refreshTokenDto.email,
      refreshTokenDto.refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = await this.authService.generateAccessToken(
      refreshTokenDto.email,
    );
    const response = new RefreshTokenResponseDTO();
    response.email = refreshTokenDto.email;
    response.accessToken = newAccessToken;
    return this.responseUtil.successResponse(0, response);
  }
}
