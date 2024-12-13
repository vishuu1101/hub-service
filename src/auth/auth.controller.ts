import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from './dto/user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @HttpCode(HttpStatus.OK)
    @Post("/signin")
    singin(@Body() userDto: UserDTO){
        return this.authService.signIn(userDto.emailId, userDto.password)
    }

    @Post("/signout")
    singOut(){

    }
}
