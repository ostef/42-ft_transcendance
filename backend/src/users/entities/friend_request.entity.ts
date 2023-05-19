import { Entity, PrimaryColumn, CreateDateColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity ()
export class FriendRequestEntity
{
    @PrimaryColumn ({type: "uuid", name: "fromUserId"})
    @ManyToOne (() => UserEntity, (user) => user.id, {eager: true})
    fromUser: UserEntity;

    @PrimaryColumn ({type: "uuid", name: "toUserId"})
    @ManyToOne (() => UserEntity, (user) => user.id, {eager: true})
    toUser: UserEntity;

    @CreateDateColumn ()
    date: Date;
}
