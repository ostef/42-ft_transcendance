import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  //TODO: use bcrypt to hash the password ?
  async validateUser(profile: any): Promise<any> {
    const user = await this.usersService.findOne(profile.username);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user) throw new BadRequestException('Unauthorized access');
    const userFound = await this.usersService.findOne(user.username);
    if (!userFound) {
      //TODO: change this to create a new user
      throw new BadRequestException('User not found');
    }
    const payload = { username: user.username };
    return this.jwtService.sign(payload);
  }
}
