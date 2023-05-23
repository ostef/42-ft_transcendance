import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, Repository } from "typeorm";

import { ChannelEntity } from "./entities/channel.entity";
import { InviteEntity } from "./entities/invite.entity";
import { CreateChannelDto, UpdateChannelDto } from "./entities/channel.dto";
import { UsersService } from "src/users/users.service";
import { UserEntity } from "src/users/entities/user.entity";

@Injectable ()
export class ChannelsService
{
    constructor (
        @InjectRepository (ChannelEntity)
        private channelRepository: Repository<ChannelEntity>,

        @InjectRepository (InviteEntity)
        private inviteRepository: Repository<InviteEntity>,

        private usersService: UsersService,
    ) {}

    async findMultipleChannels (params: any, relations: FindOptionsRelations<ChannelEntity> = {}): Promise<ChannelEntity[]>
    {
        return await this.channelRepository.find ({where: params, relations: relations});
    }

    // Returns the user entity that satisfies the params, null if it does not exist
    async findChannelEntity (params: any, relations: FindOptionsRelations<ChannelEntity> = {}): Promise<ChannelEntity>
    {
        return await this.channelRepository.findOne ({where: params, relations: relations});
    }

    async createChannel (userId: string, params: CreateChannelDto)
    {
        const user = await this.usersService.findUserEntity ({id: userId });
        if (!user)
            throw new Error ("User " + userId + " does not exist");

        const channel = this.channelRepository.create ();
        channel.owner = user;
        channel.users = [user];
        channel.administrators = [user];
        channel.name = params.name;
        channel.description = params.description;
        channel.isPrivate = params.isPrivate;
        if (channel.password != undefined)
            channel.password = params.password;

        await this.channelRepository.save (channel);
    }

    // Throws and exception if:
    // - channel does not exist
    // - user does not exist
    // - user is not an admin of channel
    // Never returns null values
    async findChannelAndAdminUser (channelId: string, userId: string, relations: FindOptionsRelations<ChannelEntity> = {}): Promise<{ channel: ChannelEntity, user: UserEntity }>
    {
        relations.administrators = true;

        const channel = await this.findChannelEntity ({id: channelId}, relations);
        if (!channel)
            throw new Error ("Channel " + channelId + " does not exist");

        const adminIdx = channel.administrators.findIndex ((val) => val.id == userId);
        if (adminIdx == -1)
            throw new Error ("User " + userId + " is not an administrator");

        return { channel: channel, user: channel.administrators[adminIdx] };
    }

    async deleteChannel (fromUser: string, id: string)
    {
        const channelAndAdmin = await this.findChannelAndAdminUser (id, fromUser);

        await this.channelRepository.remove (channelAndAdmin.channel);
    }

    async updateChannel (userId: string, params: UpdateChannelDto)
    {
        const channelAndAdmin = await this.findChannelAndAdminUser (
            params.id, userId,
            {
                owner: true,
                users: true,
                bannedUsers: params.usersToBan != undefined || params.usersToUnban != undefined,
                mutedUsers: params.usersToMute != undefined || params.usersToUnmute != undefined,
            }
        );
        const channel = channelAndAdmin.channel;

        if (params.name != undefined)
            channel.name = params.name;

        if (params.description != undefined)
            channel.description = params.description;

        // @Note (stefan): Should we cancel all pending invites when making
        // channels private ?
        if (params.isPrivate != undefined)
            channel.isPrivate = params.isPrivate;

        if (params.password != undefined)
            channel.password = params.password;

        if (params.usersToAdmin != undefined)
        {
            for (const otherId of params.usersToAdmin)
            {
                const indexInJoinedUsers = channel.users.findIndex ((val) => val.id == otherId);
                if (indexInJoinedUsers != -1)
                    throw new Error ("User " + otherId + " is not a member of channel " + channel.id);

                const index = channel.administrators.findIndex ((val) => val.id == otherId);
                if (index != -1)
                    throw new Error ("User " + otherId + " is already an admin of channel " + channel.id);

                const other = await this.usersService.findUserEntity ({id: otherId});
                if (!other)
                    throw new Error ("User " + otherId + " does not exist");

                channel.administrators.push (other);
            }
        }

        if (params.usersToUnadmin != undefined)
        {
            for (const otherId of params.usersToUnadmin)
            {
                const indexInJoinedUsers = channel.users.findIndex ((val: UserEntity) => val.id == otherId);
                if (indexInJoinedUsers != -1)
                    throw new Error ("User " + otherId + " is not a member of channel " + channel.id);

                // @Note (stefan): should we allow unadmin self ?
                if (otherId == userId)
                    throw new Error ("Cannot unadmin self");

                if (otherId == channel.owner.id)
                    throw new Error ("Cannot unadmin channel owner");

                const index = channel.administrators.findIndex ((val) => val.id == otherId);
                if (index == -1)
                    throw new Error ("User " + otherId + " is not an admin of channel " + channel.id);

                delete channel.administrators[index];
            }
        }

        if (params.usersToBan != undefined)
        {
            for (const otherId of params.usersToBan)
            {
                if (otherId == userId)
                    throw new Error ("Cannot ban self");

                if (otherId == channel.owner.id)
                    throw new Error ("Cannot ban channel owner");

                const user = await this.usersService.findUserEntity ({id: otherId});
                if (!user)
                    throw new Error ("User " + otherId + " does not exist");

                const indexInBanned = channel.bannedUsers.findIndex ((val) => val.id == otherId);
                if (indexInBanned != -1)
                    throw new Error ("User " + otherId + " is already banned");

                channel.bannedUsers.push (user);
            }
        }

        if (params.usersToUnban != undefined)
        {
            for (const otherId of params.usersToUnban)
            {
                const user = await this.usersService.findUserEntity ({id: otherId});
                if (!user)
                    throw new Error ("User " + otherId + " does not exist");

                const index = channel.bannedUsers.findIndex ((val) => val.id == otherId);
                if (index == -1)
                    throw new Error ("User " + otherId + " is not banned");

                delete channel.bannedUsers[index];
            }
        }

        if (params.usersToMute != undefined)
        {
            for (const otherId of params.usersToMute)
            {
                if (!channel.hasUser (otherId))
                    throw new Error ("User " + otherId + " is not a member of channel " + channel.id);

                const user = await this.usersService.findUserEntity ({id: otherId});
                if (!user)
                    throw new Error ("User " + otherId + " does not exist");

                if (channel.isMuted (otherId))
                    throw new Error ("User " + otherId + " is already muted");

                if (channel.isAdmin (otherId))
                    throw new Error ("Cannot mute admin");

                channel.mutedUsers.push (user);
            }
        }

        if (params.usersToUnmute != undefined)
        {
            for (const otherId of params.usersToUnmute)
            {
                if (!channel.hasUser (otherId))
                    throw new Error ("User " + otherId + " is not a member of channel " + channel.id);

                const index = channel.mutedUsers.findIndex ((val) => val.id == otherId);
                if (index == -1)
                    throw new Error ("User " + otherId + " is not muted");

                delete channel.mutedUsers[index];
            }
        }

        if (params.usersToKick != undefined)
        {
            for (const otherId of params.usersToKick)
            {
                const indexInJoinedUsers = channel.users.findIndex ((val: UserEntity) => val.id == otherId);
                if (indexInJoinedUsers != -1)
                    throw new Error ("User " + otherId + " is not a member of channel " + channel.id);

                if (otherId == userId)
                    throw new Error ("Cannot kick self");

                if (otherId == channel.owner.id)
                    throw new Error ("Cannot kick channel owner");

                const adminIndex = channel.administrators.findIndex ((val: UserEntity) => val.id == otherId);
                if (adminIndex != -1)
                    throw new Error ("Cannot kick admin");

                // @Todo (stefan): update user's joinedChannels array
                // Or does it update automatically ?
                delete channel.users[indexInJoinedUsers];
            }
        }

        await this.channelRepository.save (channel);
    }

    // No verification is done here, this is just a function that is
    // made for other services to use (i.e. the message service when
    // appending messages to the channel)
    async saveChannel (channel: ChannelEntity)
    {
        await this.channelRepository.save (channel);
    }

    async joinChannel (channelId: string, userId: string, password?: string)
    {
        const channel = await this.findChannelEntity ({id: channelId}, {users: true});
        if (!channel)
            throw new Error ("Channel " + channelId + " does not exist");

        const user = await this.usersService.findUserEntity ({id: userId}, {joinedChannels: true});
        if (!user)
            throw new Error ("User " + userId + " does not exist");

        if (channel.hasUser (user))
            throw new Error ("User " + userId + " is already in channel " + channelId);

        if (channel.isPrivate)
            throw new Error ("Channel is private, you need to be invited");

        if (!channel.password && password != undefined)
            throw new Error ("Channel password invalid");

        if (channel.password && channel.password != password)
            throw new Error ("Channel password invalid");

        channel.users.push (user);
        this.saveChannel (channel);

        user.joinedChannels.push (channel);
        this.usersService.saveUser (user);
    }

    async leaveChannel (channelId: string, userId: string, newOwnerId?: string)
    {
        const channel = await this.findChannelEntity ({id: channelId}, {owner: true, users: true, administrators: true});
        if (!channel)
            throw new Error ("Channel " + channelId + " does not exist");

        const user = await this.usersService.findUserEntity ({id: userId}, {joinedChannels: true});
        if (!user)
            throw new Error ("User " + userId + " does not exist");

        if (channel.owner.id == user.id)
        {
            if (newOwnerId == undefined)
                throw new Error ("Leaving channel as owner without specifying new owner");

            if (!channel.hasUser (newOwnerId))
                throw new Error ("Specified new owner is not in channel");

            const newOwner = await this.usersService.findUserEntity ({id: newOwnerId});
            if (!newOwner)
                throw new Error ("User " + newOwnerId + " does not exist");

            if (!channel.isAdmin (newOwnerId))
                channel.administrators.push (newOwner);

            channel.owner = newOwner;
        }

        if (!channel.hasUser (userId))
            throw new Error ("User is not in channel");

        const userIndex = channel.users.findIndex ((val) => val.id == userId);
        delete channel.users[userIndex];

        const channelIndex = user.joinedChannels.findIndex ((val) => val.id == channelId);
        delete user.joinedChannels[channelIndex];

        this.saveChannel (channel);
        this.usersService.saveUser (user);
    }

    /*
    async findInviteEntity (params: any, relations: FindOptionsRelations<InviteEntity> = {}): Promise<InviteEntity>
    {
        return await this.inviteRepository.findOne ({where: params, relations: relations});
    }

    async inviteToChannel (fromUserId: string, toUserId: string, channelId: string)
    {
        const channel = await this.findChannelEntity ({id: channelId});
        if (!channel)
            throw new Error ("Channel " + channelId + " does not exist");

        const fromUser = await this.usersService.findUserEntity ({id: fromUserId});
        if (!fromUser)
            throw new Error ("User " + fromUserId + " does not exist");

        const toUser = await this.usersService.findUserEntity ({id: toUserId});
        if (!toUser)
            throw new Error ("User " + toUserId + " does not exist");

        let invite = await this.findInviteEntity ({fromUser: fromUser, toUser: toUser, channel: channel});
        if (invite)
        {
            invite.accepted = false;
            invite.expirationDate = new Date (Date.now () + 48 * 60 * 60 * 1000);   // Expiration date is 48h from now
        }
    }

    async acceptInvite (inviteId: string, userId: string)
    {
        const invite = await this.findInviteEntity (
            {fromUser: fromUserId, toUser: toUserId, channel: channelId},
            {toUser: {joinedChannels: true}, channel: {users: true}}
        );

        if (!invite)
            throw new Error ("Invite does not exist");

        if (invite.accepted)
            throw new Error ("Invite has already been accepted");

        if (new Date () > invite.expirationDate)
            throw new Error ("Invite has expired");

        invite.accepted = true;
        invite.channel.users.push (invite.toUser);
        await this.saveChannel (invite.channel);

        invite.toUser.joinedChannels.push (invite.channel);
        await this.usersService.saveUser (invite.toUser);
    }
    */
}
