import {
    Entity,
    PrimaryGeneratedColumn, PrimaryColumn, Column, CreateDateColumn,
    OneToOne, OneToMany, ManyToOne, ManyToMany,
    JoinColumn, JoinTable,
} from "typeorm";
import { UserEntity } from "src/users/entities/user.entity";
import { ChannelEntity } from "./channel.entity";
import { MessageEntity } from "./message.entity";

@Entity ()
export class InviteEntity
{
    @PrimaryColumn ({type: "int", name: "fromUserId"})
    @ManyToOne (() => UserEntity, (user) => user.id, {eager: true})
    fromUser: UserEntity;

    @PrimaryColumn ({type: "int", name: "toUserId"})
    @ManyToOne (() => UserEntity, (user) => user.id, {eager: true})
    toUser: UserEntity;

    @PrimaryColumn ({type: "int", name: "channelId"})
    @ManyToOne (() => ChannelEntity, (chan) => chan.id, {eager: true})
    channel: ChannelEntity;

    @CreateDateColumn ()
    date: Date;

    @Column ()
    expirationDate: Date;

    @OneToOne (() => MessageEntity, (msg) => msg.invite)
    message: MessageEntity;
}
