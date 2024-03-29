import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, Repository } from "typeorm";

import { ChannelEntity } from "./entities/channel.entity";
import { ChannelInviteEntity } from "./entities/channel_invite.entity";
import { UsersService } from "src/users/users.service";
import { UserEntity } from "src/users/entities/user.entity";

import { createHash } from "crypto";
import { ChannelDto, CreateChannelParams, UpdateChannelParams } from "./types";
import { validate } from "class-validator";

@Injectable ()
export class ChannelsService
{
    constructor (
        @InjectRepository (ChannelEntity)
        private channelRepository: Repository<ChannelEntity>,

        @InjectRepository (ChannelInviteEntity)
        private inviteRepository: Repository<ChannelInviteEntity>,

        private usersService: UsersService,
    ) {}

    async findMultipleChannels (params: any, relations: FindOptionsRelations<ChannelEntity> = {}): Promise<ChannelEntity[]>
    {
        return await this.channelRepository.find ({where: params, relations: relations});
    }

    // Returns the user entity that satisfies the params, null if it does not exist
    async findChannelEntity (params: any, relations: FindOptionsRelations<ChannelEntity> = {}): Promise<ChannelEntity>
    {
        try
        {
            return await this.channelRepository.findOne ({where: params, relations: relations});
        }
        catch (err)
        {
            return null;
        }
    }

    async getChannelInfo (userId: string, id: string): Promise<ChannelDto>
    {
        const chan = await this.findChannelEntity ({id: id}, {owner: true, users: true, administrators: true, mutedUsers: true});
        if (!chan)
            throw new Error ("Channel does not exist");

        if (!chan.hasUser (userId))
            throw new Error ("User is not in channel");

        return ChannelDto.fromChannelEntity (chan);
    }

    hashPassword (password: string): string
    {
        return createHash ("sha256").update (password).digest ("hex");
    }

    async createChannel (userId: string, params: CreateChannelParams): Promise<ChannelEntity>
    {
        await validate (params);

        if (params.isPrivate && params.password != undefined)
            throw new Error ("Cannot create a private password protected channel");

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
        if (params.password != undefined)
            channel.hashedPassword = this.hashPassword (params.password);

        return await this.channelRepository.save (channel);
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
            throw new Error ("Channel does not exist");

        const adminIdx = channel.administrators.findIndex ((val) => val.id == userId);
        if (adminIdx == -1)
            throw new Error ("User is not an administrator");

        return { channel: channel, user: channel.administrators[adminIdx] };
    }

    async deleteChannel (fromUser: string, channelId: string)
    {
        const channel = await this.findChannelEntity ({id: channelId}, {owner: true});
        if (!channel)
            throw new Error ("Channel does not exist");

        if (channel.owner.id != fromUser)
            throw new Error ("You are not the channel owner");

        const invites = await this.inviteRepository.find ({where: {channel: {id: channelId}}, relations: {channel: true}});
        for (const inv of invites)
        {
            inv.channel = null;
            await this.inviteRepository.save (inv);
        }

        await this.channelRepository.remove (channel);
    }

    async updateChannel (userId: string, channelId: string, params: UpdateChannelParams)
    {
        await validate (params);

        const channelAndAdmin = await this.findChannelAndAdminUser (
            channelId, userId,
            {
                owner: true,
                users: true,
                bannedUsers: true,
                administrators: true,
                mutedUsers: true,
            }
        );
        const channel = channelAndAdmin.channel;

        if (params.name != undefined)
        {
            if (channel.owner.id != userId)
                throw new Error ("Only the owner can change the channel name");

            if (channel.hashedPassword && (!params.passwordForAuth || channel.hashedPassword != this.hashPassword (params.passwordForAuth)))
                throw new Error ("Invalid password");

            channel.name = params.name;
        }

        if (params.description != undefined)
        {
            if (channel.owner.id != userId)
                throw new Error ("Only the owner can change the channel description");

            if (channel.hashedPassword && (!params.passwordForAuth || channel.hashedPassword != this.hashPassword (params.passwordForAuth)))
                throw new Error ("Invalid password");

            channel.description = params.description;
        }

        // @Note (stefan): Should we cancel all pending invites when making
        // channels private ?
        if (params.isPrivate != undefined)
        {
            if (channel.owner.id != userId)
                throw new Error ("Only the owner can change the channel visibility");

            if (channel.hashedPassword && (!params.passwordForAuth || channel.hashedPassword != this.hashPassword (params.passwordForAuth)))
                throw new Error ("Invalid password");

            channel.isPrivate = params.isPrivate;
        }

        if (params.removePassword != undefined && params.removePassword)
        {
            if (channel.owner.id != userId)
                throw new Error ("Only the owner can change the channel description");

            if (channel.hashedPassword && (!params.passwordForAuth || channel.hashedPassword != this.hashPassword (params.passwordForAuth)))
                throw new Error ("Invalid password");

            channel.hashedPassword = null;
        }

        if (params.password != undefined)
        {
            if (channel.owner.id != userId)
                throw new Error ("Only the owner can change the channel description");

            if (channel.hashedPassword && (!params.passwordForAuth || channel.hashedPassword != this.hashPassword (params.passwordForAuth)))
                throw new Error ("Invalid password");

            channel.hashedPassword = this.hashPassword (params.password);
        }

        if (params.usersToAdmin != undefined)
        {
            for (const otherId of params.usersToAdmin)
            {
                if (!channel.hasUser (otherId))
                    throw new Error ("User is not in channel");

                if (channel.isAdmin (otherId))
                    throw new Error ("User is already admin");

                const other = await this.usersService.findUserEntity ({id: otherId});
                if (!other)
                    throw new Error ("User does not exist");

                channel.administrators.push (other);

                if (channel.isMuted (other.id))
                    channel.mutedUsers.splice (channel.mutedUsers.findIndex ((val) => val.id == other.id), 1);
            }
        }

        if (params.usersToUnadmin != undefined)
        {
            for (const otherId of params.usersToUnadmin)
            {
                if (!channel.hasUser (otherId))
                    throw new Error ("User is not in channel");

                // @Note (stefan): should we allow unadmin self ?
                if (otherId == userId)
                    throw new Error ("Cannot unadmin self");

                if (otherId == channel.owner.id)
                    throw new Error ("Cannot unadmin channel owner");

                const index = channel.administrators.findIndex ((val) => val.id == otherId);
                if (index == -1)
                    throw new Error ("User is not an admin");

                channel.administrators.splice (index, 1);
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

                if (channel.owner.id == otherId)
                    throw new Error ("Cannot ban channel owner");

                if (channel.owner.id != userId && channel.isAdmin (otherId))
                    throw new Error ("Only the channel owner can ban admins");

                const user = await this.usersService.findUserEntity ({id: otherId});
                if (!user)
                    throw new Error ("User does not exist");

                const indexInBanned = channel.bannedUsers.findIndex ((val) => val.id == otherId);
                if (indexInBanned != -1)
                    throw new Error ("User is already banned");

                const indexInAdmin = channel.administrators.findIndex (val => val.id == otherId);
                if (indexInAdmin != -1)
                    channel.administrators.splice (indexInAdmin, 1);

                channel.bannedUsers.push (user);

                channel.removeUser (otherId);
            }
        }

        if (params.usersToUnban != undefined)
        {
            for (const otherId of params.usersToUnban)
            {
                const user = await this.usersService.findUserEntity ({id: otherId});
                if (!user)
                    throw new Error ("User does not exist");

                const index = channel.bannedUsers.findIndex ((val) => val.id == otherId);
                if (index == -1)
                    throw new Error ("User is not banned");

                channel.bannedUsers.splice (index, 1);
            }
        }

        if (params.usersToMute != undefined)
        {
            for (const otherId of params.usersToMute)
            {
                if (!channel.hasUser (otherId))
                    throw new Error ("User is not in channel");

                const user = await this.usersService.findUserEntity ({id: otherId});
                if (!user)
                    throw new Error ("User does not exist");

                if (channel.isMuted (otherId))
                    throw new Error ("User is already muted");

                if (channel.owner.id == otherId)
                    throw new Error ("Cannot mute channel owner");

                if (channel.owner.id != userId && channel.isAdmin (otherId))
                    throw new Error ("Only the channel owner can mute admins");

                channel.mutedUsers.push (user);
            }
        }

        if (params.usersToUnmute != undefined)
        {
            for (const otherId of params.usersToUnmute)
            {
                if (!channel.hasUser (otherId))
                    throw new Error ("User is not in channel");

                const index = channel.mutedUsers.findIndex ((val) => val.id == otherId);
                if (index == -1)
                    throw new Error ("User is not muted");

                channel.mutedUsers.splice (index, 1);
            }
        }

        if (params.usersToKick != undefined)
        {
            for (const otherId of params.usersToKick)
            {
                if (!channel.hasUser (otherId))
                    throw new Error ("User is not in channel");

                if (otherId == userId)
                    throw new Error ("Cannot kick self");

                if (otherId == channel.owner.id)
                    throw new Error ("Cannot kick channel owner");

                if (channel.owner.id != userId && channel.isAdmin (otherId))
                    throw new Error ("Only the channel owner can kick admins");

                const adminIndex = channel.administrators.findIndex (val => val.id == otherId);
                if (adminIndex != -1)
                    channel.administrators.splice (adminIndex, 1);

                channel.removeUser (otherId);
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
        const channel = await this.findChannelEntity ({id: channelId}, {users: true, bannedUsers: true});
        if (!channel)
            throw new Error ("Channel does not exist");

        const user = await this.usersService.findUserEntity ({id: userId});
        if (!user)
            throw new Error ("User does not exist");

        if (channel.hasUser (user))
            throw new Error ("User is already in channel");

        if (channel.isBanned (user))
            throw new Error ("You are banned from this channel");

        if (channel.isPrivate)
            throw new Error ("Channel is private, you need to be invited");

        if (!channel.hashedPassword && password)
            throw new Error ("Channel is not password protected");

        if (channel.hashedPassword && !password)
            throw new Error ("Channel is password protected");

        if (channel.hashedPassword && channel.hashedPassword != this.hashPassword (password))
            throw new Error ("Channel password invalid");

        channel.users.push (user);
        await this.saveChannel (channel);
    }

    async leaveChannel (channelId: string, userId: string, newOwnerId?: string)
    {
        const channel = await this.findChannelEntity ({id: channelId}, {owner: true, users: true, administrators: true, mutedUsers: true});
        if (!channel)
            throw new Error ("Channel does not exist");

        const user = await this.usersService.findUserEntity ({id: userId}, {blockedUsers: true, joinedChannels: true});
        if (!user)
            throw new Error ("User does not exist");

        if (channel.owner.id == user.id)
        {
            if (newOwnerId == undefined || newOwnerId == channel.owner.id)
                throw new Error ("Leaving channel as owner without specifying new owner");

            if (!channel.hasUser (newOwnerId))
                throw new Error ("Specified new owner is not in channel");

            const newOwner = await this.usersService.findUserEntity ({id: newOwnerId});
            if (!newOwner)
                throw new Error ("User does not exist");

            if (!channel.isAdmin (newOwnerId))
                channel.administrators.push (newOwner);

            if (channel.isMuted (newOwnerId))
            {
                const mutedIndex = channel.mutedUsers.findIndex (val => val.id == newOwnerId);
                channel.mutedUsers.splice (mutedIndex, 1);
            }

            if (user.hasBlocked (newOwner))
                throw new Error ("You have blocked this user");

            channel.owner = newOwner;
        }

        if (!channel.hasUser (userId))
            throw new Error ("User is not in channel");

        channel.removeUser (userId);
        await this.saveChannel (channel);
    }

    async findInviteEntity (params: any, relations: FindOptionsRelations<ChannelInviteEntity> = {}): Promise<ChannelInviteEntity>
    {
        return await this.inviteRepository.findOne ({where: params, relations: relations});
    }

    async inviteToChannel (fromUserId: string, toUserId: string, channelId: string): Promise<ChannelInviteEntity>
    {
        const channel = await this.findChannelEntity ({id: channelId});
        if (!channel)
            throw new Error ("Channel does not exist");

        const fromUser = await this.usersService.findUserEntity ({id: fromUserId});
        if (!fromUser)
            throw new Error ("User does not exist");

        const toUser = await this.usersService.findUserEntity ({id: toUserId});
        if (!toUser)
            throw new Error ("User does not exist");

        const invite = this.inviteRepository.create ();
        invite.fromUser = fromUser;
        invite.toUser = toUser;
        invite.channel = channel;
        invite.accepted = false;
        invite.expirationDate = new Date (Date.now () + 48 * 60 * 60 * 1000);   // Expiration date is 48h from now

        return await this.inviteRepository.save (invite);
    }

    async acceptInvite (fromUserId: string, inviteId: string)
    {
        const invite = await this.findInviteEntity (
            {id: inviteId},
            {toUser: {joinedChannels: true}, channel: {users: true, bannedUsers: true}}
        );

        if (!invite)
            throw new Error ("Invite does not exist");

        if (invite.toUser.id != fromUserId)
            throw new Error ("Unauthorized");

        if (invite.accepted)
            throw new Error ("Invite has already been accepted");

        if (new Date () > invite.expirationDate)
            throw new Error ("Invite has expired");

        if (invite.channel.hasUser (invite.toUser))
            throw new Error ("You are already in channel");

        if (invite.channel.isBanned (invite.toUser))
            throw new Error ("You are banned from this channel");

        invite.accepted = true;
        await this.inviteRepository.save (invite);

        invite.channel.users.push (invite.toUser);
        await this.saveChannel (invite.channel);
    }
}
