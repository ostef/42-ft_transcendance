import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
// import * as passport from 'passport';
// import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  //init express-session
  // app.use(session({}));
  // app.use(passport.initialize());
  // app.use(passport.session());
  //edit cors options

  app.enableCors({
    //origins
    origin: 'http://localhost:8080',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
