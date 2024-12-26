import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserInfoDto } from '../user/dto/user-info.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { HttpService } from '@nestjs/axios';
import { jwtConstants } from 'src/util/constants';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly refreshTokens: Map<string, string> = new Map();
  private readonly USER_SERVICE_HOST: string =
    'https://account-management-service-gden.onrender.com';

  constructor(
    @Inject('USER_MANAGEMENT_SERVICE') private readonly userClient: ClientProxy,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  async loginViaRest(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const url = `${this.USER_SERVICE_HOST}/users/getByEmail?email=${encodeURIComponent(loginDto.email)}`;
      const response = await lastValueFrom(this.httpService.get(url));
      // Convert the response to a DTO
      const userInfoDto = plainToInstance(UserInfoDto, response.data.data);
      // Compare the hashed password
      const isMatch = await bcrypt.compare(
        loginDto.password,
        userInfoDto.hashPwd,
      );

      if (isMatch) {
        const accessToken = await this.generateAccessToken(userInfoDto.email);
        const refreshToken = await this.generateRefreshToken(userInfoDto.email);

        return {
          id: userInfoDto.id,
          firstName: userInfoDto.firstName,
          lastName: userInfoDto.lastName,
          email: userInfoDto.email,
          message: 'Login successful',
          accessToken,
          refreshToken,
        };
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      if (error.message && error.status === 404) {
        throw new BadRequestException('User not found');
      }
      if (error instanceof UnauthorizedException) {
        throw error; // Rethrow specific exceptions for the caller
      }
      throw new Error('Failed to fetch data from microservice');
    }
  }

  async generateAccessToken(email: string): Promise<string> {
    return this.jwtService.signAsync({ sub: email });
  }

  async generateRefreshToken(email: string): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      { sub: email },
      { secret: jwtConstants.refresh_secret, expiresIn: '7d' },
    );

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    this.refreshTokens.set(email, hashedToken);

    return refreshToken;
  }

  async validateRefreshToken(
    email: string,
    refreshToken: string,
  ): Promise<boolean> {
    const hashedToken = this.refreshTokens.get(email);

    if (!hashedToken) return false;

    return bcrypt.compare(refreshToken, hashedToken);
  }

  async revokeRefreshToken(email: string): Promise<void> {
    this.refreshTokens.delete(email);
  }
}
