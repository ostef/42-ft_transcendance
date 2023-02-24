import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  nickname: string;

  @Column()
  password: string;

  @Column()
  has2FA: boolean;
}
