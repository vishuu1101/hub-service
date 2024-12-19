import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { AuthGuard } from 'src/util/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post('update')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string }> {
    this.userService.updateUser(updateUserDto);
    return {
      message: 'success',
    };
  }
}
