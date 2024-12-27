import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseUtil } from './util/response.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        password: configService.get<string>('DB_PASSWORD'),
        username: configService.get<string>('DB_USERNAME'),
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        database: configService.get<string>('DB_DATABASE'),
        logging: false,
      }),
    }),
    AuthModule,
    UserModule,
  ],
  providers: [ResponseUtil],
  exports: [ResponseUtil],
})
export class AppModule {}
