import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email: email },
      relations: ['userAuth'],
    });
  }

  async saveOrupdate(user: User) {
    return await this.userRepository.save(user);
  }
}
