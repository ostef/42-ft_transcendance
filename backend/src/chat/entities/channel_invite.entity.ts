import {
    Entity,
    PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne,
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

    @ManyToOne (() => ChannelEntity, {nullable: true, eager: true})
    channel: ChannelEntity;

    @CreateDateColumn ()
    date: Date;

    @Column ()
    expirationDate: Date;

    @Column ()
    accepted: boolean;
}
