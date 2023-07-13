import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FindOptionsRelations } from "typeorm/find-options/FindOptionsRelations";
import { FindOneOptions } from "typeorm/find-options/FindOneOptions";

import { UserEntity } from "./entities/user.entity";
import { CreateUserDto, UpdateUserDto } from "./entities/user.dto";

import { FriendRequestEntity } from "./entities/friend_request.entity";
import { FriendRequestDto } from "./entities/friend_request.dto";

@Injectable ()
export class UsersService
{
    constructor (
        @InjectRepository (UserEntity)
        private usersRepository: Repository<UserEntity>,

        @InjectRepository (FriendRequestEntity)
        private friendRequestsRepository: Repository<FriendRequestEntity>,
    ) {}

    // Returns the user entity that satisfies the params, null if it does not exist
    async findUserEntity (params: any, relations: FindOptionsRelations<UserEntity> = {}): Promise<UserEntity>
    {
        try
        {
            return await this.usersRepository.findOne ({where: params, relations: relations});
        }
        catch (err)
        {
            return null;
        }
    }

    async getUser2FASecret (id: string): Promise<string>
    {
        const user = await this.usersRepository.findOne (id);
        return user.twoFactorSecret;
    }

    async createUser (params: CreateUserDto): Promise<UserEntity>
    {
        CreateUserDto.validate (params);

        if (!await this.isUsernameAvailable (params.username))
            throw new Error ("Username '" + params.username + "' is not available");

        const user = this.usersRepository.create ({
            username: params.username,
            nickname: params.nickname,
            password: params.password,
            has2FA: false,
        });

        return await this.usersRepository.save (user);
    }

    async isUsernameAvailable (username: string): Promise<boolean>
    {
        const entity = await this.usersRepository.findOneBy ({username: username});

        return entity == null;
    }

    async setTwoFactorAuth (id: string, secret: string): Promise<void>
    {
        this.usersRepository.update (id, {twoFactorSecret: secret});
    }

    async turnonTwoFactorAuth (id: string): Promise<void>
    {
        this.usersRepository.update (id, {has2FA: true});
    }

    async turnoffTwoFactorAuth (id: string): Promise<void>
    {
        this.usersRepository.update (id, {has2FA: false});
    }


    async updateUser (id: string, params: UpdateUserDto)
    {
        UpdateUserDto.validate (params);

        const user = await this.findUserEntity ({id: id}, {friends: true, blockedUsers: true});
        if (!user)
            throw new Error ("Invalid user id " + id);

        const toSave = [] as UserEntity[];
        toSave.push (user);

        if (params.username != undefined && params.username != user.username)
        {
            if (!await this.isUsernameAvailable (params.username))
                throw new Error ("Username '" + params.username + "' is not available");

            user.username = params.username;
        }

        if (params.nickname != undefined)
        {
            user.nickname = params.nickname;
        }

        if (params.password != undefined)
        {
            user.password = params.password;
        }

        if (params.avatarFile != undefined)
        {
            user.avatarFile = params.avatarFile;
        }

        if (params.usersToBlock != undefined)
        {
            for (const otherId of params.usersToBlock)
            {
                if (otherId == user.id)
                    throw new Error ("Cannot block self");

                const other = await this.findUserEntity ({id: otherId}, {friends: true});
                if (!other)
                    throw new Error ("User does not exist");

                if (!user.hasBlocked (otherId))
                    user.blockedUsers.push (other);

                const friendIndex = user.friends.findIndex ((val) => val.id == otherId);
                if (friendIndex != -1)
                    user.friends.splice (friendIndex, 1);

                const otherFriendIndex = other.friends.findIndex (val => val.id == user.id);
                if (otherFriendIndex != -1)
                    other.friends.splice (otherFriendIndex, 1);

                toSave.push (other);
            }
        }

        if (params.usersToUnblock != undefined)
        {
            for (const otherId of params.usersToUnblock)
            {
                const other = await this.findUserEntity ({id: otherId});
                if (!other)
                    throw new Error ("User does not exist");

                const index = user.blockedUsers.findIndex ((val: UserEntity) => val.id == other.id);
                if (index == -1)
                    throw new Error ("User is not blocked");

                user.blockedUsers.splice (index, 1);
            }
        }

        if (params.friendsToRemove != undefined)
        {
            for (const remId of params.friendsToRemove)
            {
                const toRemove = await this.findUserEntity ({id: remId}, {friends: true});
                if (!toRemove)
                    throw new Error ("User does not exist");

                const userIdx = user.friends.findIndex ((val: UserEntity) => val.id == toRemove.id);
                const toRemoveIdx = toRemove.friends.findIndex ((val: UserEntity) => val.id == user.id);
                if (userIdx == -1 || toRemoveIdx == -1)
                    throw new Error ("You are not friends with this user");

                user.friends.splice (userIdx, 1);
                toRemove.friends.splice (toRemoveIdx, 1);

                toSave.push (toRemove);
            }
        }

        // @Todo: handle 2fa

        for (const it of toSave)
            await this.usersRepository.save (it);   // @Speed: use update if possible
    }

    async saveUser (user: UserEntity)
    {
        await this.usersRepository.save (user);
    }

    // Returns the entity that satisfies the params, null if it does not exist
    async findFriendRequest (params: any): Promise<FriendRequestEntity>
    {
        return await this.friendRequestsRepository.findOne ({
            where: params,
            relations: {
                fromUser: {friends: true, blockedUsers: true},
                toUser:   {friends: true, blockedUsers: true}
            }
        });
    }

    async findMultipleFriendRequests (params: any): Promise<FriendRequestEntity[]>
    {
        return await this.friendRequestsRepository.find ({
            where: params,
            relations: {
                fromUser: {friends: true, blockedUsers: true},
                toUser:   {friends: true, blockedUsers: true}
            }
        });
    }

    async sendFriendRequest (params: FriendRequestDto)
    {
        FriendRequestDto.validate (params);

        if (params.fromUser == params.toUser)
            throw new Error ("Cannot send friend request to self");

        const fromUser = await this.findUserEntity ({id: params.fromUser }, {friends: true, blockedUsers: true});
        if (!fromUser)
            throw new Error ("User does not exist");

        const toUser = await this.findUserEntity ({id: params.toUser }, {friends: true, blockedUsers: true});
        if (!toUser)
            throw new Error ("User does not exist");

        if (fromUser.isFriendsWith (params.toUser))
            throw new Error ("You are already friends with this user");

        if (toUser.isFriendsWith (params.fromUser))
            throw new Error ("You are already friends with this user");

        if (fromUser.hasBlocked (params.toUser))
            throw new Error ("You have blocked this user");

        if (toUser.hasBlocked (params.fromUser))
            throw new Error ("You have been blocked by this user");

        const req = this.friendRequestsRepository.create ();
        req.fromUser = fromUser;
        req.toUser = toUser;

        await this.friendRequestsRepository.save (req);
    }

    async acceptFriendRequest (params: FriendRequestDto)
    {
        FriendRequestDto.validate (params);

        const req = await this.findFriendRequest (params);
        if (req == null)
            throw new Error ("Friend request does not exist");

        if (req.fromUser.hasBlocked (req.toUser))
            throw new Error ("This user has blocked you");

        if (req.fromUser.hasBlocked (req.toUser))
            throw new Error ("You have been blocked by this user");

        if (req.toUser.hasBlocked (req.fromUser))
            throw new Error ("You have blocked this user");

        req.fromUser.friends.push (req.toUser);
        req.toUser.friends.push (req.fromUser);
        await this.usersRepository.save (req.fromUser);
        await this.usersRepository.save (req.toUser);

        try {
            const inverse = await this.findFriendRequest ({fromUser: params.toUser, toUser: params.fromUser});
            await this.friendRequestsRepository.remove (inverse);
        }
        catch (err) {}

        await this.friendRequestsRepository.remove (req);
    }

    async cancelFriendRequest (params: FriendRequestDto)
    {
        FriendRequestDto.validate (params);

        const req = await this.findFriendRequest (params);
        if (!req)
            throw new Error ("Friend request does not exist");

        await this.friendRequestsRepository.remove (req);
    }

    async declineFriendRequest (params: FriendRequestDto)
    {
        await this.cancelFriendRequest (params);
    }
}
