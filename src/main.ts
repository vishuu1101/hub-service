import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('hub-service');

  //enabling for all to test
  app.enableCors();

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Hub Service')
    .setDescription(
      'Mircoservice which acts as an aggregator and serves all the requests of UI to provide necessary data where required',
    )
    .setVersion('1.0.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('hub-service/swagger-doc', app, swaggerDocument);
  await app.listen(4000);
}
bootstrap();
