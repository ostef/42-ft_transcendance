import {
    Entity,
    PrimaryGeneratedColumn, Column, JoinColumn, CreateDateColumn,JoinTable,
    OneToOne, OneToMany, ManyToOne, ManyToMany,
} from "typeorm";
import { UserEntity } from "src/users/entities/user.entity";
import { MessageEntity } from "./message.entity";

// Public channel: listed in channel search, all users can join
// Private channel: not listed in channel search, only invited users can join
// Password: for both public and private channels

@Entity ()
export class ChannelEntity
{
    @PrimaryGeneratedColumn ("uuid")
    id: string;

    @CreateDateColumn ()
    dateCreated: Date;

    @Column ({type: "varchar", length: 100})
    name: string;

    @Column ({type: "varchar", length: 512})
    description: string;

    @Column ()
    isPrivate: boolean;

    @Column ({nullable: true})
    password: string;

    @ManyToOne (() => UserEntity)
    owner: UserEntity;

    @ManyToMany (() => UserEntity, (u) => u.joinedChannels)
    users: UserEntity[];

    @ManyToMany (() => UserEntity)
    @JoinTable ()
    administrators: UserEntity[];

    @ManyToMany (() => UserEntity)
    @JoinTable ()
    mutedUsers: UserEntity[];

    @ManyToMany (() => UserEntity)
    @JoinTable ()
    bannedUsers: UserEntity[];

    @OneToMany (() => MessageEntity, (msg) => msg.toChannel)
    messages: MessageEntity[];

    hasUser (user: string | UserEntity): boolean
    {
        if (this.users == undefined)
            throw new Error ("Channel entity's users relation is not loaded");

        if (typeof user == "string")
            return this.users.findIndex ((val: UserEntity) => val.id == user) != -1;
        else
            return this.users.findIndex ((val: UserEntity) => val.id == user.id) != -1;
    }

    isAdmin (user: string | UserEntity): boolean
    {
        if (this.administrators == undefined)
            throw new Error ("Channel entity's administrators relation is not loaded");

        if (typeof user == "string")
            return this.administrators.findIndex ((val: UserEntity) => val.id == user) != -1;
        else
            return this.administrators.findIndex ((val: UserEntity) => val.id == user.id) != -1;
    }

    isMuted (user: string | UserEntity): boolean
    {
        if (this.mutedUsers == undefined)
            throw new Error ("Channel entity's mutedUsers relation is not loaded");

        if (typeof user == "string")
            return this.mutedUsers.findIndex ((val: UserEntity) => val.id == user) != -1;
        else
            return this.mutedUsers.findIndex ((val: UserEntity) => val.id == user.id) != -1;
    }

    isBanned (user: string | UserEntity): boolean
    {
        if (this.bannedUsers == undefined)
            throw new Error ("Channel entity's bannedUsers relation is not loaded");

        if (typeof user == "string")
            return this.bannedUsers.findIndex ((val: UserEntity) => val.id == user) != -1;
        else
            return this.bannedUsers.findIndex ((val: UserEntity) => val.id == user.id) != -1;
    }
}
