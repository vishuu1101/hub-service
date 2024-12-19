import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/util/constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: 60 },
    }),
    ClientsModule.register([
      {
        name: 'USER_MANAGEMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'account-management-service',
          port: 3001,
        },
      },
    ]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
