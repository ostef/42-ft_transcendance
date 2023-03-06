import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

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
    let registeredUser = await this.usersService.findOne(user.username);
    if (!registeredUser) {
      //TODO: change this to create a new user
      console.log('User not found, creating a new one');
      registeredUser = await this.usersService.create(user);
      console.log('Done creating user');
    } else {
      console.log('User found');
    }
    return this.jwtService.sign({ username: registeredUser.username });
  }
}
