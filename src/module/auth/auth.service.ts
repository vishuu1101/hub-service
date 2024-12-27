import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDTO } from './dto/login-request.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserInfoDto } from '../user/dto/user-info.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { HttpService } from '@nestjs/axios';
import { jwtConstants } from 'src/util/constants';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './repository/user.repository';
import { UserAuth } from './entities/user-auth.entity';
import { User } from './entities/user.entity';
import { UserAuthRepository } from './repository/user-auth.repository';
import { LogoutResponseDTO } from './dto/logout-response.dto';

@Injectable()
export class AuthService {
  private readonly USER_SERVICE_HOST: string =
    this.configService.get('USER_SERVICE_HOST');

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly userAuthRepository: UserAuthRepository,
  ) {}

  async loginViaRest(loginDto: LoginRequestDTO): Promise<LoginResponseDto> {
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

        // get user from db. if available then replace userAuth other create both objects and save in DB
        let userFromDB = await this.userRepository.getUserByEmail(
          loginDto.email,
        );
        if (userFromDB) {
          const userAuth = new UserAuth();
          userAuth.accessToken = accessToken;
          userAuth.refreshToken = refreshToken;
          userAuth.user = userFromDB;
          userFromDB.userAuth = userAuth;
        } else {
          userFromDB = new User();
          userFromDB.email = loginDto.email;
          const userAuth = new UserAuth();
          userAuth.accessToken = accessToken;
          userAuth.refreshToken = refreshToken;
          userAuth.user = userFromDB;
          userFromDB.userAuth = userAuth;
        }

        await this.userRepository.saveOrupdate(userFromDB);

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

    return refreshToken;
  }

  async validateRefreshToken(
    email: string,
    refreshToken: string,
  ): Promise<boolean> {
    const userFromDB = await this.userRepository.getUserByEmail(email);
    if (!userFromDB) {
      throw new NotFoundException(
        `User with EmailId:${email} is not available`,
      );
    }
    if (!userFromDB.userAuth) {
      throw new BadRequestException(
        `User with EmailId:${email} already logged out. Please login again.`,
      );
    }
    const refreshTokenFromDB = userFromDB.userAuth.refreshToken;

    if (!refreshTokenFromDB || refreshTokenFromDB !== refreshToken) {
      return false;
    }

    return true;
  }

  async revokeRefreshToken(email: string): Promise<LogoutResponseDTO> {
    const userFromDB = await this.userRepository.getUserByEmail(email);
    if (userFromDB && userFromDB.userAuth) {
      const userAuthId = userFromDB.userAuth.id;
      userFromDB.userAuth = null;
      await this.userRepository.saveOrupdate(userFromDB);
      await this.userAuthRepository.delete(userAuthId);
    }
    return {
      message: 'Logged out successfully',
    };
  }
}
