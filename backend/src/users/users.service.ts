import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Friendship } from './user.entity';

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
    @InjectRepository(Friendship)
    private friendsRepository: Repository<Friendship>,
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
  async update(user: User): Promise<User> {
    console.log('DEBUG: user to update: ', user);
    return this.usersRepository.save(user);
  }

  async getFriends(username: string): Promise<Friendship[]> {
    return this.friendsRepository.findBy({ username });
  }

  async addFriend(username: string, usernameFriend: string): Promise<void> {
    const friend: User = await this.findOne(usernameFriend);
    console.log('DEBUG: friend: ', friend);
    if (!friend)
      throw new Error(`User with username ${usernameFriend} does not exist`);
    const newfriend = new Friendship();
    newfriend.username = username;
    newfriend.friendname = usernameFriend;
    await this.friendsRepository.save(newfriend);

    //TODO: change this after testing// if (friends.includes(friend))
    //     throw new Error(`User with username ${usernameFriend} is already a friend`);
    // friends.push(friend);
    // return this.usersRepository
    //   .createQueryBuilder()
    //   .relation(User, 'following')
    //   .of(user)
    //   .add(friend);
    // return this.usersRepository.save({ username: user.username, friend });
    // console.log(user.following);
    // return this.usersRepository.save({ username: user.username, friend });
  }

  async removeFriend(username: string, friend: User): Promise<User> {
    const user = await this.findOne(username);
    if (!user) return null;
    // const friends = user.following;
    // friends.splice(friends.indexOf(friend), 1);
    return this.usersRepository.save({ username, friend });
  }

  async remove(username: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ username });
    if (user) {
      await this.usersRepository.delete(user);
    }
  }
}
