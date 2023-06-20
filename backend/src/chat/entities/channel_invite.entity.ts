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
export class ChannelInviteEntity
{
    @PrimaryGeneratedColumn ("uuid")
    id: string;

    @ManyToOne (() => UserEntity, {eager: true})
    fromUser: UserEntity;

    @ManyToOne (() => UserEntity, {eager: true})
    toUser: UserEntity;

    @ManyToOne (() => ChannelEntity, {eager: true})
    channel: ChannelEntity;

    @CreateDateColumn ()
    date: Date;

    @Column ()
    expirationDate: Date;

    @Column ()
    accepted: boolean;

    @OneToOne (() => MessageEntity, (msg) => msg.invite)
    message: MessageEntity;
}
