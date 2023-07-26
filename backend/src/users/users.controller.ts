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

    Injectable, NestInterceptor, ExecutionContext, CallHandler, UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator, FileTypeValidator,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { concat } from "rxjs";

import { UsersService } from "./users.service";

import { UserEntity } from "./entities/user.entity";
import { FilesService } from "../files/files.service";
import { CreateUserParams, LoggedUserDto, UpdateUserParams, UserDto } from "./types";
import {filetypename} from "magic-bytes.js";

@Controller ("user")
export class UsersController
{
    private logger: Logger = new Logger ("UsersController");

    constructor (
        private usersService: UsersService,
        private filesService: FilesService,
    ) {}

    @Get ()
    async findCurrentUser (@Request () req): Promise<LoggedUserDto>
    {
        const entity = await this.usersService.findUserEntity ({id: req.user.id});
        if (entity == null)
            throw new NotFoundException ("User with id " + req.user.id + " does not exist");

        const requests = await this.usersService.findMultipleFriendRequests ({toUserId: req.user.id});

        return LoggedUserDto.fromUserEntityAndFriendRequests (entity, requests);
    }

    /*
    @SetMetadata ("isPublic", true)
    @Post ()
    async createUser (@Body () body: CreateUserParams): Promise<string>
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
    */

    @Put ()
    async updateUser (@Request () req, @Body () body: UpdateUserParams)
    {
        try
        {
            await this.usersService.updateUser(req.user.id, body);
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Put("avatar")
    @UseInterceptors(FileInterceptor('avatar'))
    async updateAvatar(
        @Request() req,

        @UploadedFile (
            new ParseFilePipe ({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
                    new FileTypeValidator({fileType: 'image'})
                ]
            })
        )
        file: Express.Multer.File
    )
    {
        try
        {
            const filename= req.user.id + "." + file.originalname.split(".").pop();
            const filetype = filetypename(file.buffer.slice(0, 8));
            if (filetype[0] != "png")
                throw new Error("Avatar file must be a PNG file");
            this.filesService.changeFile(filename, file.buffer);
            // TODO: change url to be dynamic
            const url = "http://" + window.location.hostname + ":3000/files/" + filename + "?t=" + Date.now();
            await this.usersService.updateUser(req.user.id, {avatarFile: url});
            return url;
        }
        catch (err)
        {
            this.logger.error(err.stack);
            throw new BadRequestException(err.message);
        }
    }

    @Get ("friends")
    async getFriends (@Request () req): Promise<UserDto[]>
    {
        const user = await this.usersService.findUserEntity ({id: req.user.id}, {friends: {blockedUsers: true}, blockedUsers: true});
        if (!user)
            throw new NotFoundException ("User does not exist");

        const result = [] as UserDto[];
        for (const u of user.friends)
        {
            result.push (UserDto.fromUserEntity (user, u));
        }

        return result;
    }

    @Post ("friends/add/:id")
    async sendFriendRequest (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.usersService.sendFriendRequest (req.user.id, {toUser: id});
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
            await this.usersService.acceptFriendRequest (req.user.id, {fromUser: id});
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
            await this.usersService.declineFriendRequest (req.user.id, {fromUser: id});
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Get ("profile/:id")
    async getUserInfo (@Request () req, @Param ("id") id: string): Promise<UserDto>
    {
        const me = await this.usersService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});
        const user = await this.usersService.findUserEntity ({id: id}, {friends: true, blockedUsers: true});
        if (!user)
            throw new BadRequestException ("User does not exist");

        return UserDto.fromUserEntity (me, user)
    }

    @Get (":id/matchHistory")
    async getMatchHistory (@Param ("id") id: string)
    {
        const user = await this.usersService.findUserEntity({id: id});
        if (!user)
            throw new NotFoundException ("User " + id + " does not exist");
        const matchHistory =
        console.log("gameHistory", user.gameHistory);
        console.log("gameHistory2", user.gameHistory2);
        if (user.gameHistory && user.gameHistory2)
            return concat(user.gameHistory, user.gameHistory2);
        return user.gameHistory ? user.gameHistory : user.gameHistory2;
    }
}
