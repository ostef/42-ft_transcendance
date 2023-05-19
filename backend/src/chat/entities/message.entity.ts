import {
    Entity,
    PrimaryGeneratedColumn, Column, JoinColumn, JoinTable,
    OneToOne, OneToMany, ManyToOne, ManyToMany,
} from "typeorm";
import { UserEntity } from "src/users/entities/user.entity";
import { ChannelEntity } from "./channel.entity";
import { InviteEntity } from "./invite.entity";
import { PrivateConversationEntity } from "./private_conversation.entity";

@Entity ()
export class MessageEntity
{
    @PrimaryGeneratedColumn ("uuid")
    id: number;

    @ManyToOne (() => UserEntity)
    fromUser: UserEntity;

    @ManyToOne (() => ChannelEntity, (chan) => chan.messages, {nullable: true})
    toChannel: ChannelEntity;

    @ManyToOne (() => PrivateConversationEntity, (conv) => conv.messages, {nullable: true})
    toPrivateConversation: PrivateConversationEntity;

    @Column ({type: "text"})
    content: string;

    @OneToOne (() => InviteEntity, (inv) => inv.message, {nullable: true})
    invite: InviteEntity;
}
