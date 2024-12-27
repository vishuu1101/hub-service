import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UpdateUserRequestDTO } from './dto/update-user-request.dto';
import { UserService } from './user.service';
import { AuthGuard } from 'src/util/auth.guard';
import { ApiBody } from '@nestjs/swagger';
import { ResponseUtil } from 'src/util/response.util';

@Controller('v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseUtil: ResponseUtil,
  ) {}

  @UseGuards(AuthGuard)
  @Post('update')
  @ApiBody({
    type: UpdateUserRequestDTO,
  })
  async updateUser(
    @Body() updateUserDto: UpdateUserRequestDTO,
  ): Promise<{ message: string }> {
    const response = await this.userService.updateUser(updateUserDto);
    return this.responseUtil.successResponse(0, response);
  }
}
