import {
  Controller,
  Request,
  Response,
  Get,
  Post,
  UseGuards,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { FortyTwoAuthGuard } from './auth/fortytwo-auth.guard';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { User } from './users/user.entity';

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

  @Get('user/:username')
  @UseGuards(JwtAuthGuard)
  async getUser(@Request() req, @Response() res) {
    const { username } = req.params;
    try {
      const user = await this.userService.findOne(username);
      return res.status(HttpStatus.OK).send(user);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).send(err.message);
    }
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req, @Response() res) {
    // res.status(HttpStatus.OK);
    return res.status(HttpStatus.OK).send(req.user);
  }

  //debug adduser
  @Post('user')
  async addUser(@Request() req, @Response() res) {
    try {
      const { username, nickname, password } = req.body;
      const newuser: User = new User();
      newuser.username = username;
      newuser.nickname = nickname;
      newuser.password = password;
      newuser.avatar = null;
      newuser.has2FA = false;
      newuser.conversations = [];

      const user = await this.userService.create(newuser);
      return res.status(HttpStatus.OK).send(user);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).send(err.message);
    }
  }

  //update nickname
  @Post('user/nickname')
  @UseGuards(JwtAuthGuard)
  async updateNickname(@Request() req, @Response() res) {
    try {
      const { nickname } = req.body;
      req.user.nickname = nickname;
      const user = await this.userService.update(req.user);
      return res.status(HttpStatus.OK).send(user);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).send(err.message);
    }
  }

  //friends
  @Get('friends')
  @UseGuards(JwtAuthGuard)
  async getFriends(@Request() req, @Response() res) {
    return res
      .status(HttpStatus.OK)
      .send(await this.userService.getFriends(req.user.username));
  }

  @Post('friends/add')
  @UseGuards(JwtAuthGuard)
  async addFriend(@Request() req, @Response() res) {
    const usernameFriend = req.body.username;
    try {
      await this.userService.addFriend(req.user.username, usernameFriend);
      return res
        .status(HttpStatus.OK)
        .send(await this.userService.getFriends(req.user.username));
      // return res.status(HttpStatus.OK).send(req.user.following);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).send(err.message);
    }
  }

  @Delete('friends/remove')
  @UseGuards(JwtAuthGuard)
  async removeFriend(@Request() req, @Response() res) {
    const { friend } = req.body;
    const user = await this.userService.removeFriend(req.user, friend);
    return res.status(HttpStatus.OK).send();
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
