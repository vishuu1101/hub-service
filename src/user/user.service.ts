import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { lastValueFrom } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { UserInfoDto } from './dto/user-info.dto';

@Injectable()
export class UserService {
  private readonly USER_SERVICE_HOST: string =
    'https://account-management-service-gden.onrender.com';
  constructor(private readonly httpService: HttpService) {}

  async updateUser(updateUserDto: UpdateUserDto): Promise<UserInfoDto> {
    try {
      const url = `${this.USER_SERVICE_HOST}/users/updateUser`;
      const response = await lastValueFrom(
        this.httpService.post(url, updateUserDto),
      );
      console.log(response);
      return plainToInstance(UserInfoDto, response.data);
    } catch (error) {
      console.error('Error while updating user:', error.message);
      throw new Error('Failed to user data in microservice');
    }
  }
}
