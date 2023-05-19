import {
    Entity,
    PrimaryGeneratedColumn, PrimaryColumn, Column, CreateDateColumn,
    OneToOne, OneToMany, ManyToOne, ManyToMany,
    JoinColumn, JoinTable,
} from "typeorm";
import { UserEntity } from "src/users/entities/user.entity";
import { MessageEntity } from "./message.entity";

@Entity ()
export class PrivateConversationEntity
{
    // firstUser and secondUser are sorted by id (firstUser is the
    // user with the id that is less than secondUser's)

    @PrimaryColumn ({type: "uuid", name: "firstUserId"})
    @ManyToOne (() => UserEntity, (user) => user.id, {eager: true})
    firstUser: UserEntity;

    @PrimaryColumn ({type: "uuid", name: "secondUserId"})
    @ManyToOne (() => UserEntity, (user) => user.id, {eager: true})
    secondUser: UserEntity;

    @OneToMany (() => MessageEntity, (msg) => msg.toPrivateConversation)
    messages: MessageEntity[];
}