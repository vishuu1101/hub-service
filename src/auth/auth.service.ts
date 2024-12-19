import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserInfoDto } from './dto/user-info.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_MANAGEMENT_SERVICE') private readonly userClient: ClientProxy,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const userFromDB = await lastValueFrom(
        this.userClient
          .send<string>({ cmd: 'getUserInfo' }, loginDto.email)
          .pipe(
            catchError((error) => {
              Logger.error(
                `Error in userClient: ${error.message}`,
                error.stack,
              );
              if (error.message && error.message.statusCode === 404) {
                throw new BadRequestException('User not found');
              }
              throw new InternalServerErrorException(
                'An error occurred while fetching user info',
              );
            }),
          ),
      );

      // Convert the response to a DTO
      const userInfoDto = plainToInstance(UserInfoDto, userFromDB);

      // Compare the hashed password
      const isMatch = await bcrypt.compare(
        loginDto.password,
        userInfoDto.hashPwd,
      );

      if (isMatch) {
        const payload = { sub: userInfoDto.id, username: userInfoDto.email };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
          email: userInfoDto.email,
          message: 'Login successful',
          accessToken,
        };
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      Logger.error('Validation failed', error.stack);
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // Rethrow specific exceptions for the caller
      }
      throw new InternalServerErrorException('Unable to validate user');
    }
  }

  async loginViaRest(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const url = `https://account-management-service-gden.onrender.com/users/getByEmail?email=${encodeURIComponent(loginDto.email)}`;
      const response = await lastValueFrom(
        this.httpService.get(
          url,
        ),
      );
      // Convert the response to a DTO
      const userInfoDto = plainToInstance(UserInfoDto, response.data);
      // Compare the hashed password
      const isMatch = await bcrypt.compare(
        loginDto.password,
        userInfoDto.hashPwd,
      );

      if (isMatch) {
        const payload = { sub: userInfoDto.id, username: userInfoDto.email };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
          email: userInfoDto.email,
          message: 'Login successful',
          accessToken,
        };
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      if ( error instanceof UnauthorizedException ) {
        throw error; // Rethrow specific exceptions for the caller
      }
      throw new Error('Failed to fetch data from microservice');
    }
  }
}
