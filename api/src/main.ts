import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  // to be able to use the transformers and validators
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3002);
}
bootstrap();
