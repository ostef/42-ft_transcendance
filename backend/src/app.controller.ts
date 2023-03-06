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
import { UsersService } from './users/users.service';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @UseGuards(FortyTwoAuthGuard)
  @Get('auth/42')
  async auth(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('auth/valid')
  @UseGuards(JwtAuthGuard)
  async authDone(@Request() req, @Response() res) {
    return res.status(HttpStatus.OK).send();
  }

  @Get('auth/42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async FortyTwoAuthCallback(@Request() req, @Response() res) {
    const token = await this.authService.login(req.user);
    res.cookie('access_token', token, {
      secure: false,
      sameSite: 'strict',
      maxAge: 3600 * 1000, // 1 hour
    });
    return res.status(HttpStatus.OK).send('<script>window.close();</script >');
  }

  @Post('user')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req, @Response() res) {
    // res.status(HttpStatus.OK);
    return res.status(HttpStatus.OK).send(req.user);
  }

  //friends
  @Post('friends/add')
  @UseGuards(JwtAuthGuard)
  async addFriend(@Request() req, @Response() res) {
    const { usernameFriend } = req.body;
    try {
      const user = await this.userService.addFriend(req.user, usernameFriend);
      return res.status(HttpStatus.OK).send(user.friends);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).send(err.message);
    }
  }

  @Post('friends/remove')
  @UseGuards(JwtAuthGuard)
  async removeFriend(@Request() req, @Response() res) {
    const { friend } = req.body;
    const user = await this.userService.removeFriend(req.user, friend);
    return res.status(HttpStatus.OK).send(user.friends);
  }

  @Post('auth/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req, @Response() res) {
    res.clearCookie('access_token');
    return res.status(HttpStatus.OK).send('OK');
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
