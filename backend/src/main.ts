import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

// @Todo: allow logging in with 42 from another computer

async function bootstrap ()
{
    const app = await NestFactory.create (AppModule);
    app.useGlobalPipes (new ValidationPipe ());
    app.enableCors ();

    await app.listen (3000);
}

bootstrap ();
