import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    NotFoundException,
    Param,
    Post, Put,
    Request,
    SetMetadata,
} from "@nestjs/common";

import { UsersService } from "./users.service";

import { CreateUserDto, UpdateUserDto, UserDto } from "./entities/user.dto";
import { UserEntity } from "./entities/user.entity";
import { FriendRequestDto } from "./entities/friend_request.dto";

class SensitiveUserInfo extends UserDto
{
    receivedFriendRequests: string[];
}

@Controller ("user")
export class UsersController
{
    private logger: Logger = new Logger ("UsersController");

    constructor (
        private usersService: UsersService,
    ) {}

    @Get ()
    async findCurrentUser (@Request () req): Promise<SensitiveUserInfo>
    {
        const entity = await this.usersService.findUserEntity ({id: req.user.id});
        if (entity == null)
            throw new NotFoundException ("User with id " + req.user.id + " does not exist");

        const requests = await this.usersService.findMultipleFriendRequests ({toUser: req.user.id});

        const result : SensitiveUserInfo = {
            ...entity,
            receivedFriendRequests: requests.map ((val) => val.fromUser.id)
        };

        return result;
    }

    @SetMetadata ("isPublic", true)
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
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
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
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Get ("friends")
    async getFriends (@Request () req): Promise<string[]>
    {
        const user = await this.usersService.findUserEntity ({id: req.user.id}, {friends: true});
        if (!user)
            throw new NotFoundException ("User " + req.user.id + " does not exist");

        const result = [];
        for (const u of user.friends)
        {
            result.push ({
                id: u.id,
                username: u.username,
                nickname: u.nickname,
                avatarFile: u.avatarFile
            });
        }

        return result;
    }

    @Post ("friends/add/:id")
    async sendFriendRequest (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.usersService.sendFriendRequest ({fromUser: req.user.id, toUser: id} as FriendRequestDto);
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Post ("friends/accept/:id")
    async acceptFriendRequest (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.usersService.acceptFriendRequest ({fromUser: id, toUser: req.user.id} as FriendRequestDto);
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Post ("friends/decline/:id")
    async declineFriendRequest (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.usersService.declineFriendRequest ({fromUser: id, toUser: req.user.id} as FriendRequestDto);
        }
        catch (err)
        {
            this.logger.error (err.stack);
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

        return result as unknown as UserDto;
    }
}
