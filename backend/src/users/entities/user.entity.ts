import {
    Entity,
    PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable,
} from "typeorm";

import { ChannelEntity } from "src/chat/entities/channel.entity";
import { PrivateConversationEntity } from "src/chat/entities/private_conversation.entity";
import { FriendRequestEntity } from "./friend_request.entity";

@Entity ()
export class UserEntity
{
    @PrimaryGeneratedColumn ("uuid")
    id: string;

    @Column ({ type: "varchar", length: 100, unique: true })
    username: string;

    @Column ({ type: "varchar", length: 100})
    nickname: string;

    // Some accounts must log in using 42auth, so they might not have a password
    @Column ({ nullable: true })
    password: string;

    @Column ()
    has2FA: boolean;

    @Column ({ nullable: true })
    avatarFile: string;

    @ManyToMany (() => UserEntity, (u) => u.friends)
    @JoinTable ()
    friends: UserEntity[];

    @ManyToMany (() => UserEntity, (u) => u.blockedUsers)
    @JoinTable ()
    blockedUsers: UserEntity[];

    @ManyToMany (() => ChannelEntity, (chan) => chan.users)
    @JoinTable ()
    joinedChannels: ChannelEntity[];

    @ManyToMany (() => PrivateConversationEntity)
    @JoinTable ()
    privateConversations: PrivateConversationEntity[];

    isFriendsWith (other: string | UserEntity): boolean
    {
        if (typeof other == "string")
            return this.friends.findIndex ((val: UserEntity) => val.id == other) != -1;
        else
            return this.friends.findIndex ((val: UserEntity) => val.id == other.id) != -1;
    }

    hasBlocked (other: string | UserEntity): boolean
    {
        if (typeof other == "string")
            return this.blockedUsers.findIndex ((val: UserEntity) => val.id == other) != -1;
        else
            return this.blockedUsers.findIndex ((val: UserEntity) => val.id == other.id) != -1;
    }
};