import {
    Entity,
    PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable,
} from "typeorm";

import { ChannelEntity } from "src/chat/entities/channel.entity";
import { PrivateConversationEntity } from "src/chat/entities/private_conversation.entity";
import { FriendRequestEntity } from "./friend_request.entity";
import { gameHistoryEntity } from "src/game/entities/gameHistory.entity";

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
    joinedChannels: ChannelEntity[];

    @ManyToMany (() => PrivateConversationEntity)
    @JoinTable ()
    privateConversations: PrivateConversationEntity[];

    @OneToMany(() => gameHistoryEntity, (gameHistoryEntity) => gameHistoryEntity.user1)
    gameHistory : gameHistoryEntity[]

    @OneToMany(() => gameHistoryEntity, (gameHistoryEntity) => gameHistoryEntity.user2)
    gameHistory2 : gameHistoryEntity[]
    
    isInChannel (other: string | ChannelEntity): boolean
    {
        if (!this.joinedChannels)
            throw new Error ("joinedChannels relation is not loaded");

        if (typeof other == "string")
            return this.joinedChannels.findIndex ((val) => val.id == other) != -1;
        else
            return this.joinedChannels.findIndex ((val) => val.id == other.id) != -1;
    }

    isFriendsWith (other: string | UserEntity): boolean
    {
        if (!this.friends)
            throw new Error ("friends relation is not loaded");

        if (typeof other == "string")
            return this.friends.findIndex ((val) => val.id == other) != -1;
        else
            return this.friends.findIndex ((val) => val.id == other.id) != -1;
    }

    hasBlocked (other: string | UserEntity): boolean
    {
        if (!this.blockedUsers)
            throw new Error ("blockedUsers relation is not loaded");

        if (typeof other == "string")
            return this.blockedUsers.findIndex ((val) => val.id == other) != -1;
        else
            return this.blockedUsers.findIndex ((val) => val.id == other.id) != -1;
    }
};
