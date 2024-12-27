import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { UpdateUserRequestDTO } from './dto/update-user-request.dto';
import { lastValueFrom } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { UpdateUserResponseDTO } from './dto/update-user-response.dto';

@Injectable()
export class UserService {
  private readonly USER_SERVICE_HOST: string =
    this.configService.get('USER_SERVICE_HOST');
  constructor(private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async updateUser(updateUserDto: UpdateUserRequestDTO): Promise<UpdateUserResponseDTO> {
    try {
      const url = `${this.USER_SERVICE_HOST}/users/updateUser`;
      const response = await lastValueFrom(
        this.httpService.post(url, updateUserDto),
      );
      return plainToInstance(UpdateUserResponseDTO, response.data.data);
    } catch (error) {
      console.error('Error while updating user:', error.message);
      throw new Error('Failed to user data in microservice');
    }
  }
}
