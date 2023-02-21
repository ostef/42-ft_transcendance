import {
  Controller,
  Request,
  Response,
  Get,
  Post,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { FortyTwoAuthGuard } from './auth/fortytwo-auth.guard';
import { AuthService } from './auth/auth.service';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  @UseGuards(FortyTwoAuthGuard)
  @Get('auth/42')
  async auth(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('auth/42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async FortyTwoAuthCallback(@Request() req, @Response() res) {
    const token = await this.authService.login(req.user);
    res.cookie('access_token', token, {
      secure: false,
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
    });
    return res.status(HttpStatus.OK);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello-protected')
  @UseGuards(JwtAuthGuard)
  getHelloProtected(@Request() req): string {
    console.log('Hello protected');
    return this.appService.getHello();
  }
}
