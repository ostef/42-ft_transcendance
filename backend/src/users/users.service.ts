import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

// // This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  // private readonly users = [
  //   {
  //     userId: 1,
  //     username: 'glemoine',
  //     password: 'changeme',
  //   },
  //   {
  //     userId: 2,
  //     username: 'maria',
  //     password: 'guess',
  //   },
  // ];

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(username: string): Promise<User> {
    return this.usersRepository.findOneBy({ username });
  }

  async create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async addFriend(username: string, usernameFriend: string): Promise<User> {
    const user = await this.findOne(username);
    const friend = await this.findOne(usernameFriend);
    if (!user) throw new Error(`User with username ${username} does not exist`);
    if (!friend)
      throw new Error(`User with username ${usernameFriend} does not exist`);
    const friends = user.friends;
    friends.push(friend);
    return this.usersRepository.save({ username, friends });
  }

  async removeFriend(username: string, friend: User): Promise<User> {
    const user = await this.findOne(username);
    if (!user) return null;
    const friends = user.friends;
    friends.splice(friends.indexOf(friend), 1);
    return this.usersRepository.save({ username, friend });
  }

  async remove(username: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ username });
    if (user) {
      await this.usersRepository.delete(user);
    }
  }
}
