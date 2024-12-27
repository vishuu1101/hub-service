import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAuth } from '../entities/user-auth.entity';

export class UserAuthRepository {
  constructor(
    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
  ) {}

  async delete(userAuthId: number) {
    await this.userAuthRepository.delete(userAuthId);
  }
}
