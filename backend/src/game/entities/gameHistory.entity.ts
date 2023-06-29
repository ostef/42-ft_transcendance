import {
    Entity,
    PrimaryGeneratedColumn, Column, JoinColumn, CreateDateColumn,JoinTable,
    OneToOne, OneToMany, ManyToOne, ManyToMany,
} from "typeorm";

import { UserEntity } from "src/users/entities/user.entity";

// Public channel: listed in channel search, all users can join
// Private channel: not listed in channel search, only invited users can join
// Password: for both public and private channels

@Entity ()
export class gameHistoryEntity
{
    @PrimaryGeneratedColumn({ type : "bigint"})
    id: number;

    @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.gameHistory)
    user1 : UserEntity

    @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.gameHistory2)
    user2 : UserEntity

    @Column()
    scoreP1 : number

    @Column()
    scoreP2 : number

    @ManyToOne(() => UserEntity)
    winner : UserEntity
}