import { Entity, PrimaryColumn, CreateDateColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity ()
export class FriendRequestEntity
{
    @PrimaryColumn ({type: "uuid"})
    fromUserId: string;

    @PrimaryColumn ({type: "uuid"})
    toUserId: string;

    @ManyToOne (() => UserEntity, (user) => user.id, {eager: true})
    fromUser: UserEntity;

    @ManyToOne (() => UserEntity, (user) => user.id, {eager: true})
    toUser: UserEntity;

    @CreateDateColumn ()
    date: Date;
}
