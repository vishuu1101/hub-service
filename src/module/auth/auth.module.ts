import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/util/constants';
import { HttpModule } from '@nestjs/axios';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/user.repository';
import { UserAuthRepository } from './repository/user-auth.repository';
import { UserAuth } from './entities/user-auth.entity';
import { ResponseUtil } from 'src/util/response.util';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '5m' },
    }),
    TypeOrmModule.forFeature([User, UserAuth]),
  ],
  providers: [AuthService, UserRepository, UserAuthRepository, ResponseUtil],
  controllers: [AuthController],
})
export class AuthModule {}
