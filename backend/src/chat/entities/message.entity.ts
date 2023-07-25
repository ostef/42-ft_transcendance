import {
    Entity,
    PrimaryGeneratedColumn, Column, JoinColumn,
    OneToOne, ManyToOne, CreateDateColumn,
} from "typeorm";
import { UserEntity } from "src/users/entities/user.entity";
import { ChannelEntity } from "./channel.entity";
import { ChannelInviteEntity } from "./channel_invite.entity";
import { PrivateConversationEntity } from "./private_conversation.entity";

@Entity ()
export class MessageEntity
{
    @PrimaryGeneratedColumn ("uuid")
    id: number;

    @ManyToOne (() => UserEntity)
    fromUser: UserEntity;

    @ManyToOne (() => ChannelEntity, (chan) => chan.messages, {nullable: true, onDelete: "CASCADE"})
    toChannel?: ChannelEntity;

    @ManyToOne (() => PrivateConversationEntity, (conv) => conv.messages, {nullable: true, onDelete: "CASCADE"})
    toPrivateConversation?: PrivateConversationEntity;

    @Column ({type: "text"})
    content: string;

    @OneToOne (() => ChannelInviteEntity, {eager: true, nullable: true})
    @JoinColumn ()
    invite?: ChannelInviteEntity;

    @CreateDateColumn ()
    timestamp: Date;
}
