import {
    Controller, Logger,
    Get, Post, Put, Body, Param, Delete,
    BadRequestException, NotFoundException,
    Response, Request,
    HttpStatus,
} from "@nestjs/common";

import { UsersService } from "./users.service";

import { CreateUserDto, UpdateUserDto, UserDto } from "./entities/user.dto";
import { UserEntity } from "./entities/user.entity";

import { ReceivedFriendRequestDto, SentFriendRequestDto } from "./entities/friend_request.dto";

@Controller ("users")
export class UsersController
{
    private logger: Logger = new Logger ("UsersController");

    constructor (
        private usersService: UsersService,
    ) {}

    @Get ()
    async findCurrentUser (@Request () req): Promise<UserDto>
    {
        const entity = await this.usersService.findUserEntity ({id: req.user.id});
        if (entity == null)
            throw new NotFoundException ("User with id " + req.user.id + " does not exist");

        const { password, ...result } = entity;

        return result as UserDto;
    }

    @Post ()
    async createUser (@Body () body: CreateUserDto): Promise<string>
    {
        try
        {
            const entity = await this.usersService.createUser (body);

            return entity.id;
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Delete ()
    async deleteUser (@Request () req)
    {
        await this.usersService.deleteUser (req.user.id);
    }

    @Put ()
    async updateUser (@Request () req, @Body () body: UpdateUserDto)
    {
        try
        {
            await this.usersService.updateUser (req.user.id, body);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Get ("friends")
    async getFriends (@Request () req): Promise<string[]>
    {
        const user = await this.usersService.findUserEntity ({id: req.user.id}, {friends: true});
        if (!user)
            throw new NotFoundException ("User " + req.user.id + " does not exist");

        return user.friends.map ((val: UserEntity) => val.id);
    }

    @Post ("friends/add/:id")
    async sendFriendRequest (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.usersService.sendFriendRequest ({fromUser: req.user.id, toUser: id});
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Post ("friends/accept/:id")
    async acceptFriendRequest (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.usersService.acceptFriendRequest ({fromUser: id, toUser: req.user.id});
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Post ("friends/decline/:id")
    async declineFriendRequest (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.usersService.declineFriendRequest ({fromUser: id, toUser: req.user.id});
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Get ("profile/:id")
    async findUser (@Param ("id") id: string): Promise<UserDto>
    {
        const entity = await this.usersService.findUserEntity ({id: id});
        if (entity == null)
            throw new NotFoundException ("User with id " + id + " does not exist");

        const { password, ...result } = entity;

        return result as UserDto;
    }
}
